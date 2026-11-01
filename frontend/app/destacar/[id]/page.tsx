'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { startCheckout } from '@/lib/checkout';
import { eurCents, dateEs } from '@/lib/format';

function Destacar() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const { session, loading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [listing, setListing] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const sb = supabaseBrowser();
    sb.from('products').select('*').order('price_cents').then(({ data }) => setProducts(data || []));
    sb.from('listings').select('id,title,status,highlight_until,top_until').eq('id', id).maybeSingle().then(({ data }) => setListing(data));
  }, [session, id]);

  if (loading) return <div className="container"><p>Cargando…</p></div>;
  if (!session) return <div className="container narrow"><Link href={`/acceso?next=/destacar/${id}`}>Inicia sesión para continuar</Link></div>;
  if (!listing) return <div className="container narrow"><p>Anuncio no encontrado.</p></div>;

  const onlyExtra = params.get('pago') === 'anuncio';
  const visible = products.filter((p) => (onlyExtra ? p.kind === 'extra_listing' : p.kind !== 'extra_listing'));

  async function buy(code: string) {
    setBusy(code);
    const err = await startCheckout({ kind: 'product', product: code, listingId: id });
    if (err) setMsg(err);
    setBusy(null);
  }

  return (
    <div className="container narrow-lg">
      <h1>{onlyExtra ? 'Publicar anuncio adicional' : 'Mejora la visibilidad'}</h1>
      <p className="muted">{listing.title}</p>
      {!onlyExtra && (
        <p className="small muted">
          {listing.top_until && new Date(listing.top_until) > new Date() && <>Top activo hasta {dateEs(listing.top_until)}. </>}
          {listing.highlight_until && new Date(listing.highlight_until) > new Date() && <>Destacado hasta {dateEs(listing.highlight_until)}.</>}
        </p>
      )}
      <div className="grid grid-3">
        {visible.map((p) => (
          <div key={p.code} className="panel">
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div className="plan-price small-price">{eurCents(p.price_cents)}</div>
            <p className="muted small">{p.duration_days} días</p>
            <button className="btn btn-primary btn-block" onClick={() => buy(p.code)} disabled={busy === p.code}>
              {busy === p.code ? 'Redirigiendo…' : 'Contratar'}
            </button>
          </div>
        ))}
      </div>
      {msg && <p className="notice notice-err">{msg}</p>}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Destacar />
    </Suspense>
  );
}
