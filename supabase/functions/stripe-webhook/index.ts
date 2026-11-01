// Webhook de Stripe: activa suscripciones, destacados y anuncios de pago.
// Desplegar con verify_jwt = false. Secretos: STRIPE_WEBHOOK_SECRET.
import { createClient } from 'npm:@supabase/supabase-js@2';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Verifica la firma "Stripe-Signature" (HMAC SHA-256 sobre "t.payload")
async function verify(payload: string, header: string, secret: string) {
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=') as [string, string]));
  const t = parts['t'];
  const sigs = header.split(',').filter((x) => x.startsWith('v1=')).map((x) => x.slice(3));
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`)));
  const expected = Array.from(mac).map((b) => b.toString(16).padStart(2, '0')).join('');
  return sigs.some((s) => s.length === expected.length && [...s].reduce((acc, ch, i) => acc | (ch.charCodeAt(0) ^ expected.charCodeAt(i)), 0) === 0);
}

const addDays = (from: Date, days: number) => new Date(from.getTime() + days * 86400000);

async function applyProduct(purchaseId: string, sessionId: string, amount: number | null) {
  const { data: purchase } = await admin.from('purchases').select('*').eq('id', purchaseId).single();
  if (!purchase || purchase.status === 'paid') return; // idempotente
  const { data: product } = await admin.from('products').select('*').eq('code', purchase.product_code).single();
  if (!product || !purchase.listing_id) return;
  await admin.from('purchases').update({ status: 'paid', stripe_session_id: sessionId, amount_cents: amount ?? purchase.amount_cents }).eq('id', purchaseId);

  const { data: listing } = await admin.from('listings').select('*').eq('id', purchase.listing_id).single();
  if (!listing) return;
  const now = new Date();
  if (product.kind === 'extra_listing') {
    await admin.from('listings').update({ status: 'published', published_at: now.toISOString(), expires_at: addDays(now, product.duration_days).toISOString(), updated_at: now.toISOString() }).eq('id', listing.id);
  } else if (product.kind === 'highlight' || product.kind === 'top') {
    const col = product.kind === 'top' ? 'top_until' : 'highlight_until';
    const current = listing[col] && new Date(listing[col]) > now ? new Date(listing[col]) : now;
    await admin.from('listings').update({ [col]: addDays(current, product.duration_days).toISOString() }).eq('id', listing.id);
  }
}

async function upsertSubscription(sub: any) {
  const userId = sub.metadata?.user_id;
  const plan = sub.metadata?.plan;
  if (!userId || !plan) return;
  const periodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      plan_code: plan,
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: !!sub.cancel_at_period_end,
    },
    { onConflict: 'stripe_subscription_id' }
  );
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!secret) return new Response('Webhook no configurado', { status: 503 });
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  if (!(await verify(payload, sig, secret))) return new Response('Firma no válida', { status: 400 });

  const event = JSON.parse(payload);
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        if (s.metadata?.kind === 'product' && s.payment_status === 'paid') {
          await applyProduct(s.metadata.purchase_id, s.id, s.amount_total);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await upsertSubscription(event.data.object);
        break;
    }
  } catch (e) {
    console.error('Error procesando evento', event.type, e);
    return new Response('Error', { status: 500 }); // Stripe reintentara
  }
  return new Response('ok');
});
