// Crea una sesion de Stripe Checkout (suscripcion de plan o pago unico de producto).
// Secretos necesarios: STRIPE_SECRET_KEY. SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los aporta Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

async function stripe(path: string, params: URLSearchParams, key: string) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Error de Stripe');
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) return json({ error: 'El pago todavía no está disponible' }, 503);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  const { data: userData } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (!user) return json({ error: 'No autenticado' }, 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Petición no válida' }, 400);
  }

  // Solo se aceptan origenes propios para las URLs de retorno
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || 'https://habitaclick.es,http://localhost:3000').split(',');
  const origin = allowed.includes(body.origin) ? body.origin : allowed[0];

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) return json({ error: 'Perfil no encontrado' }, 400);

  try {
    // Cliente de Stripe (se crea una vez y se guarda)
    let customer = profile.stripe_customer_id as string | null;
    if (!customer) {
      const c = await stripe(
        'customers',
        new URLSearchParams({ email: user.email!, name: profile.company_name || profile.full_name || '', 'metadata[user_id]': user.id }),
        stripeKey
      );
      customer = c.id;
      await admin.from('profiles').update({ stripe_customer_id: customer }).eq('id', user.id);
    }

    const p = new URLSearchParams();
    p.set('customer', customer!);
    p.set('client_reference_id', user.id);
    p.set('locale', 'es');
    p.set('metadata[user_id]', user.id);

    if (body.kind === 'subscription') {
      if (profile.account_type !== 'profesional') return json({ error: 'Los planes son para cuentas profesionales' }, 403);
      const { data: plan } = await admin.from('plans').select('*').eq('code', body.plan).eq('active', true).single();
      if (!plan) return json({ error: 'Plan no válido' }, 400);
      p.set('mode', 'subscription');
      p.set('success_url', `${origin}/cuenta?tab=plan&pago=ok`);
      p.set('cancel_url', `${origin}/profesionales`);
      p.set('metadata[kind]', 'subscription');
      p.set('metadata[plan]', plan.code);
      p.set('subscription_data[metadata][user_id]', user.id);
      p.set('subscription_data[metadata][plan]', plan.code);
      if (plan.stripe_price_id) {
        p.set('line_items[0][price]', plan.stripe_price_id);
      } else {
        p.set('line_items[0][price_data][currency]', 'eur');
        p.set('line_items[0][price_data][unit_amount]', String(plan.price_month_cents));
        p.set('line_items[0][price_data][recurring][interval]', 'month');
        p.set('line_items[0][price_data][product_data][name]', `Habitaclick plan ${plan.name}`);
      }
      p.set('line_items[0][quantity]', '1');
    } else if (body.kind === 'product') {
      const { data: product } = await admin.from('products').select('*').eq('code', body.product).eq('active', true).single();
      if (!product) return json({ error: 'Producto no válido' }, 400);
      const { data: listing } = await admin.from('listings').select('id, owner_id, status').eq('id', body.listingId).single();
      if (!listing || listing.owner_id !== user.id) return json({ error: 'Anuncio no válido' }, 403);

      if (product.kind === 'extra_listing') {
        if (profile.account_type !== 'particular') return json({ error: 'Producto solo para particulares' }, 403);
        if (listing.status !== 'pending_payment') return json({ error: 'El anuncio no está pendiente de pago' }, 400);
      } else if (listing.status !== 'published') {
        return json({ error: 'Solo se pueden destacar anuncios publicados' }, 400);
      }

      const { data: purchase } = await admin
        .from('purchases')
        .insert({ user_id: user.id, product_code: product.code, listing_id: listing.id, amount_cents: product.price_cents })
        .select('id')
        .single();

      p.set('mode', 'payment');
      p.set('success_url', `${origin}/cuenta?tab=anuncios&pago=ok`);
      p.set('cancel_url', `${origin}/destacar/${listing.id}`);
      p.set('metadata[kind]', 'product');
      p.set('metadata[product]', product.code);
      p.set('metadata[listing_id]', listing.id);
      p.set('metadata[purchase_id]', purchase!.id);
      if (product.stripe_price_id) {
        p.set('line_items[0][price]', product.stripe_price_id);
      } else {
        p.set('line_items[0][price_data][currency]', 'eur');
        p.set('line_items[0][price_data][unit_amount]', String(product.price_cents));
        p.set('line_items[0][price_data][product_data][name]', product.name);
      }
      p.set('line_items[0][quantity]', '1');
    } else {
      return json({ error: 'Tipo de compra no válido' }, 400);
    }

    const session = await stripe('checkout/sessions', p, stripeKey);
    if (body.kind === 'product') {
      await admin.from('purchases').update({ stripe_session_id: session.id }).eq('id', p.get('metadata[purchase_id]'));
    }
    return json({ url: session.url });
  } catch (e) {
    console.error(e);
    return json({ error: 'No se pudo iniciar el pago' }, 500);
  }
});
