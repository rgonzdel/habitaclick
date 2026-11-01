// Envia las alertas de busqueda guardadas por email. Pensada para ejecutarse por cron (cada hora).
// Secretos: RESEND_API_KEY, ALERTS_FROM (ej. "Habitaclick <alertas@habitaclick.es>"), CRON_SECRET, SITE_URL.
import { createClient } from 'npm:@supabase/supabase-js@2';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const SITE = Deno.env.get('SITE_URL') || 'https://habitaclick.es';
const INTERVAL_MS: Record<string, number> = { instant: 0, daily: 86400000, weekly: 7 * 86400000 };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function applyFilters(q: any, f: Record<string, string>) {
  if (f.operation) q = q.eq('operation', f.operation);
  if (f.province) q = q.eq('province', f.province);
  if (f.city) q = q.ilike('city', `%${f.city}%`);
  if (f.type) q = q.eq('property_type', f.type);
  if (f.minPrice) q = q.gte('price', Number(f.minPrice));
  if (f.maxPrice) q = q.lte('price', Number(f.maxPrice));
  if (f.bedrooms) q = q.gte('bedrooms', Number(f.bedrooms));
  if (f.bathrooms) q = q.gte('bathrooms', Number(f.bathrooms));
  if (f.minArea) q = q.gte('built_area', Number(f.minArea));
  if (f.condition) q = q.eq('condition', f.condition);
  if (f.features) q = q.contains('features', f.features.split(',').filter(Boolean));
  return q;
}

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) return new Response('No autorizado', { status: 401 });
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return new Response('Email no configurado', { status: 503 });

  const { data: searches } = await admin.from('saved_searches').select('*').eq('active', true).limit(500);
  let sent = 0;
  for (const s of searches || []) {
    const last = s.last_sent_at ? new Date(s.last_sent_at).getTime() : 0;
    if (Date.now() - last < (INTERVAL_MS[s.frequency] ?? 86400000)) continue;
    const since = s.last_sent_at || s.created_at;

    let q = admin.from('listings_ranked').select('id,title,price,operation,city,province,cover_url').gt('published_at', since).order('published_at', { ascending: false }).limit(10);
    q = applyFilters(q, s.filters || {});
    const { data: items } = await q;
    if (!items?.length) continue;

    const { data: u } = await admin.auth.admin.getUserById(s.user_id);
    const email = u?.user?.email;
    if (!email) continue;

    const rows = items
      .map(
        (l: any) =>
          `<tr><td style="padding:8px 0"><a href="${SITE}/inmueble/${l.id}" style="color:#003366;font-weight:600">${esc(l.title)}</a><br>${esc(l.city)} (${esc(l.province)}) · ${Number(l.price).toLocaleString('es-ES')} €${l.operation === 'alquiler' ? '/mes' : ''}</td></tr>`
      )
      .join('');
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px"><h2 style="color:#003366">${items.length} anuncio(s) nuevo(s) para «${esc(s.name || 'tu búsqueda')}»</h2><table width="100%">${rows}</table><p style="font-size:12px;color:#667585">Recibes este correo porque creaste una alerta en Habitaclick. <a href="${SITE}/cuenta?tab=alertas">Gestionar o eliminar alertas</a>.</p></div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: Deno.env.get('ALERTS_FROM') || 'Habitaclick <onboarding@resend.dev>', to: email, subject: `Nuevos anuncios: ${s.name || 'tu búsqueda'}`, html }),
    });
    if (res.ok) {
      await admin.from('saved_searches').update({ last_sent_at: new Date().toISOString() }).eq('id', s.id);
      sent++;
    } else console.error('Resend error', await res.text());
  }
  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } });
});
