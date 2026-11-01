'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { priceLabel, dateEs } from '@/lib/format';
import ListingCard from '@/components/ListingCard';

const STATUS: Record<string, string> = {
  draft: 'Borrador',
  pending_payment: 'Pendiente de pago',
  published: 'Publicado',
  paused: 'Pausado',
  expired: 'Caducado',
  rejected: 'Rechazado',
};

type Tab = 'anuncios' | 'mensajes' | 'favoritos' | 'alertas' | 'plan';

function Cuenta() {
  const { session, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const sb = supabaseBrowser();
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'anuncios');
  const [listings, setListings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [favs, setFavs] = useState<any[]>([]);
  const [searches, setSearches] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const uid = session.user.id;
    const [l, ld, fv, ss, sb2] = await Promise.all([
      sb.from('listings').select('*').eq('owner_id', uid).order('created_at', { ascending: false }),
      sb.from('leads').select('*, listings(title, owner_id)').order('created_at', { ascending: false }).limit(100),
      sb.from('favorites').select('listing_id').eq('user_id', uid),
      sb.from('saved_searches').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      sb.from('subscriptions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    ]);
    setListings(l.data || []);
    setLeads((ld.data || []).filter((x: any) => x.listings?.owner_id === uid));
    setSearches(ss.data || []);
    setSubs(sb2.data || []);
    const ids = (fv.data || []).map((x: any) => x.listing_id);
    if (ids.length) {
      const { data } = await sb.from('listings_ranked').select('*').in('id', ids);
      setFavs(data || []);
    } else setFavs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (!loading && !session) router.push('/acceso?next=/cuenta');
  }, [loading, session, router]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setEditName(profile?.full_name || '');
    setEditPhone(profile?.phone || '');
  }, [profile]);

  if (loading || !session) return <div className="container"><p>Cargando…</p></div>;

  async function setStatus(id: string, status: string) {
    await sb.from('listings').update({ status }).eq('id', id);
    load();
  }
  async function republish(id: string) {
    const { data } = await sb.rpc('publish_listing', { p_listing: id });
    if (data === 'payment_required') router.push(`/destacar/${id}?pago=anuncio`);
    else if (data === 'subscription_required' || data === 'plan_limit_reached') router.push('/profesionales');
    load();
  }
  async function remove(id: string) {
    if (!confirm('¿Eliminar este anuncio? No se puede deshacer.')) return;
    await sb.from('listings').delete().eq('id', id);
    load();
  }
  async function markRead(id: string) {
    await sb.from('leads').update({ read: true }).eq('id', id);
    load();
  }
  async function deleteSearch(id: string) {
    await sb.from('saved_searches').delete().eq('id', id);
    load();
  }
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    await sb.from('profiles').update({ full_name: editName, phone: editPhone || null }).eq('id', session!.user.id);
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const unread = leads.filter((x) => !x.read).length;
  const activeSub = subs.find((s) => ['active', 'trialing'].includes(s.status));

  return (
    <div className="container">
      <h1>Mi cuenta</h1>
      <div className="tabs tabs-line">
        {([
          ['anuncios', 'Mis anuncios'],
          ['mensajes', `Mensajes${unread ? ` (${unread})` : ''}`],
          ['favoritos', 'Favoritos'],
          ['alertas', 'Alertas'],
          ['plan', 'Plan y datos'],
        ] as [Tab, string][]).map(([k, label]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'anuncios' && (
        <section>
          <div className="row-between">
            <p className="muted">{listings.length} anuncios</p>
            <Link href="/publicar" className="btn btn-primary">Nuevo anuncio</Link>
          </div>
          {listings.length === 0 && <div className="empty"><p>Aún no has publicado ningún anuncio.</p></div>}
          <div className="table">
            {listings.map((l) => (
              <div key={l.id} className="trow">
                <div>
                  <Link href={`/inmueble/${l.id}`}><b>{l.title}</b></Link>
                  <div className="muted small">
                    {priceLabel(l)} · {l.city} · {STATUS[l.status]} {l.is_free_ad && '· Gratis'}
                    {l.expires_at && l.status === 'published' && ` · caduca ${dateEs(l.expires_at)}`}
                    {` · ${l.views} visitas`}
                  </div>
                </div>
                <div className="actions">
                  {l.status === 'published' && (
                    <>
                      <Link className="btn btn-outline btn-sm" href={`/destacar/${l.id}`}>Destacar</Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => setStatus(l.id, 'paused')}>Pausar</button>
                    </>
                  )}
                  {l.status === 'paused' && <button className="btn btn-ghost btn-sm" onClick={() => republish(l.id)}>Reactivar</button>}
                  {['draft', 'pending_payment', 'expired'].includes(l.status) && (
                    <button className="btn btn-primary btn-sm" onClick={() => republish(l.id)}>Publicar</button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => remove(l.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'mensajes' && (
        <section>
          {leads.length === 0 && <div className="empty"><p>No tienes mensajes todavía.</p></div>}
          <div className="table">
            {leads.map((x) => (
              <div key={x.id} className={`trow ${x.read ? '' : 'unread'}`}>
                <div>
                  <b>{x.name}</b> <span className="muted small">sobre «{x.listings?.title}» · {dateEs(x.created_at)}</span>
                  <p className="prewrap">{x.message}</p>
                  <div className="small">
                    <a href={`mailto:${x.email}`}>{x.email}</a>
                    {x.phone && <> · <a href={`tel:${x.phone}`}>{x.phone}</a></>}
                  </div>
                </div>
                {!x.read && <button className="btn btn-ghost btn-sm" onClick={() => markRead(x.id)}>Marcar leído</button>}
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'favoritos' && (
        <section>
          {favs.length === 0 && <div className="empty"><p>Guarda anuncios con el corazón para verlos aquí.</p></div>}
          <div className="grid">{favs.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        </section>
      )}

      {tab === 'alertas' && (
        <section>
          {searches.length === 0 && <div className="empty"><p>Crea alertas desde el buscador para recibir anuncios nuevos por email.</p></div>}
          <div className="table">
            {searches.map((s) => (
              <div key={s.id} className="trow">
                <div>
                  <b>{s.name || 'Búsqueda'}</b>
                  <div className="muted small">Frecuencia: {s.frequency === 'instant' ? 'al momento' : s.frequency === 'daily' ? 'diaria' : 'semanal'}</div>
                </div>
                <div className="actions">
                  <Link className="btn btn-outline btn-sm" href={`/buscar?${new URLSearchParams(s.filters).toString()}`}>Ver</Link>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteSearch(s.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'plan' && (
        <section className="two-col">
          <div className="panel">
            <h3>Mis datos</h3>
            <form className="form" onSubmit={saveProfile}>
              <label className="field">Nombre<input value={editName} onChange={(e) => setEditName(e.target.value)} /></label>
              <label className="field">Teléfono<input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></label>
              <p className="muted small">Correo: {session.user.email} · Tipo de cuenta: {profile?.account_type}</p>
              <button className="btn btn-primary">{saved ? 'Guardado' : 'Guardar'}</button>
            </form>
          </div>
          <div className="panel">
            <h3>Suscripción</h3>
            {profile?.account_type === 'profesional' ? (
              activeSub ? (
                <p>Plan activo: <b>{activeSub.plan_code}</b>{activeSub.current_period_end && <> · renueva el {dateEs(activeSub.current_period_end)}</>}</p>
              ) : (
                <>
                  <p>No tienes ningún plan activo.</p>
                  <Link href="/profesionales" className="btn btn-primary">Ver planes</Link>
                </>
              )
            ) : (
              <p>
                {profile?.free_ad_used
                  ? 'Ya usaste tu anuncio gratuito. Los siguientes anuncios se pagan una sola vez.'
                  : 'Tienes disponible tu primer anuncio gratis.'}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default function CuentaPage() {
  return (
    <Suspense>
      <Cuenta />
    </Suspense>
  );
}
