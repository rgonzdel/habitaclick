'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { startCheckout } from '@/lib/checkout';
import { eurCents } from '@/lib/format';

type Plan = { code: string; name: string; price_month_cents: number; max_active_listings: number | null; rank_weight: number; includes_mailing: boolean };
type Product = { code: string; name: string; description: string; price_cents: number; duration_days: number };

export default function Profesionales() {
  const { session, profile } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.from('plans').select('*').order('sort_order').then(({ data }) => setPlans((data as Plan[]) || []));
    sb.from('products').select('*').order('price_cents').then(({ data }) => setProducts((data as Product[]) || []));
  }, []);

  async function choose(code: string) {
    setMsg(null);
    if (!session) return (window.location.href = '/acceso?modo=registro&next=/profesionales');
    if (profile?.account_type !== 'profesional') return setMsg('Los planes son para cuentas profesionales. Crea una cuenta de tipo profesional.');
    setBusy(code);
    const err = await startCheckout({ kind: 'subscription', plan: code });
    if (err) setMsg(err);
    setBusy(null);
  }

  const rankText = (w: number) => (w >= 3 ? 'Posicionamiento máximo' : w === 2 ? 'Posicionamiento alto' : 'Posicionamiento mejorado');

  return (
    <div className="container">
      <section className="section center">
        <h1>Planes para profesionales</h1>
        <p className="lead">Publica más, aparece antes en los resultados y llega a compradores con campañas por email.</p>
      </section>

      <div className="plans">
        {plans.map((p) => (
          <div key={p.code} className={`plan ${p.code === 'pro' ? 'plan-hot' : ''}`}>
            {p.code === 'pro' && <span className="badge">Más elegido</span>}
            <h3>{p.name}</h3>
            <div className="plan-price">{eurCents(p.price_month_cents)}<span>/mes</span></div>
            <ul>
              <li>{p.max_active_listings ? `Hasta ${p.max_active_listings} anuncios activos` : 'Anuncios ilimitados'}</li>
              <li>{rankText(p.rank_weight)} en los resultados</li>
              <li>{p.includes_mailing ? 'Incluido en campañas de email marketing' : 'Perfil de empresa en tus anuncios'}</li>
              <li>Contactos y mensajes en tu panel</li>
            </ul>
            <button className="btn btn-primary btn-block" onClick={() => choose(p.code)} disabled={busy === p.code}>
              {busy === p.code ? 'Redirigiendo…' : 'Elegir plan'}
            </button>
          </div>
        ))}
      </div>
      {msg && <p className="notice notice-err center">{msg}</p>}
      <p className="muted small center">Precios sin IVA. Puedes cancelar cuando quieras.</p>

      <section className="section">
        <h2>Posicionamiento por anuncio</h2>
        <p className="muted">Disponible para particulares y profesionales, sobre cada anuncio publicado.</p>
        <div className="grid grid-3">
          {products.filter((x) => x.code !== 'anuncio_extra').map((x) => (
            <div key={x.code} className="panel">
              <h3>{x.name}</h3>
              <p>{x.description}</p>
              <div className="plan-price small-price">{eurCents(x.price_cents)}</div>
              <p className="muted small">{x.duration_days} días</p>
            </div>
          ))}
        </div>
        <p>
          <Link href="/cuenta">Ir a mis anuncios para destacarlos</Link>
        </p>
      </section>

      <section className="section panel">
        <h2>Publicidad en Habitaclick</h2>
        <p>¿Tienes un negocio relacionado con la vivienda (reformas, mudanzas, hipotecas, seguros)? Anúnciate en la home, el buscador y las fichas.</p>
        <a className="btn btn-outline" href="mailto:publicidad@habitaclick.es">Solicitar información</a>
      </section>
    </div>
  );
}
