'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { PROVINCES, PROPERTY_TYPES, FEATURES, CONDITIONS } from '@/lib/constants';
import { startCheckout } from '@/lib/checkout';

const MAX_PHOTOS = 20;
const MAX_MB = 8;

export default function Publicar() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const sb = supabaseBrowser();
  const [f, setF] = useState<any>({ operation: 'venta', property_type: 'piso', features: [] as string[], show_exact_address: false });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<{ id: string; reason: string } | null>(null);

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const toggleFeature = (ft: string) => set('features', f.features.includes(ft) ? f.features.filter((x: string) => x !== ft) : [...f.features, ft]);

  if (loading) return <div className="container narrow"><p>Cargando…</p></div>;
  if (!session)
    return (
      <div className="container narrow">
        <div className="panel center">
          <h1>Publica tu anuncio</h1>
          <p>Crea una cuenta gratuita para anunciar. Si eres particular, tu primer anuncio es gratis.</p>
          <Link href="/acceso?modo=registro&next=/publicar" className="btn btn-primary">
            Crear cuenta o acceder
          </Link>
        </div>
      </div>
    );

  const num = (v: any) => (v === '' || v === undefined || v === null ? null : Number(v));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (files.some((x) => x.size > MAX_MB * 1024 * 1024)) return setErr(`Cada foto debe pesar menos de ${MAX_MB} MB`);
    setBusy(true);
    try {
      const { data: l, error } = await sb
        .from('listings')
        .insert({
          owner_id: session!.user.id,
          operation: f.operation,
          property_type: f.property_type,
          title: f.title,
          description: f.description || null,
          price: Number(f.price),
          province: f.province,
          city: f.city,
          district: f.district || null,
          street: f.street || null,
          show_exact_address: !!f.show_exact_address,
          bedrooms: num(f.bedrooms),
          bathrooms: num(f.bathrooms),
          built_area: num(f.built_area),
          useful_area: num(f.useful_area),
          floor: f.floor || null,
          year_built: num(f.year_built),
          features: f.features,
          energy_cert: f.energy_cert || null,
          condition: f.condition || null,
        })
        .select('id')
        .single();
      if (error || !l) throw new Error(error?.message || 'No se pudo crear el anuncio');

      // Fotos al bucket publico, en la carpeta del usuario
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        const path = `${session!.user.id}/${l.id}/${Date.now()}-${i}.${ext}`;
        const up = await sb.storage.from('listing-photos').upload(path, file, { contentType: file.type });
        if (up.error) throw new Error('Error al subir una foto: ' + up.error.message);
        const { data: pub } = sb.storage.from('listing-photos').getPublicUrl(path);
        await sb.from('listing_photos').insert({ listing_id: l.id, url: pub.publicUrl, storage_path: path, sort_order: i });
      }

      const { data: result, error: pubErr } = await sb.rpc('publish_listing', { p_listing: l.id });
      if (pubErr) throw new Error(pubErr.message);

      if (result === 'published_free' || result === 'published') return router.push(`/inmueble/${l.id}?publicado=1`);
      setBlocked({ id: l.id, reason: result });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    if (!blocked) return;
    setBusy(true);
    const msg = await startCheckout({ kind: 'product', product: 'anuncio_extra', listingId: blocked.id });
    if (msg) setErr(msg);
    setBusy(false);
  }

  if (blocked)
    return (
      <div className="container narrow">
        <div className="panel center">
          <h1>Tu anuncio está guardado</h1>
          {blocked.reason === 'payment_required' && (
            <>
              <p>Ya usaste tu anuncio gratuito. Para publicar este necesitas el pago de un anuncio adicional.</p>
              <button className="btn btn-primary" onClick={pay} disabled={busy}>
                Pagar y publicar
              </button>
            </>
          )}
          {blocked.reason === 'subscription_required' && (
            <>
              <p>Las cuentas profesionales necesitan un plan activo para publicar.</p>
              <Link href="/profesionales" className="btn btn-primary">
                Ver planes
              </Link>
            </>
          )}
          {blocked.reason === 'plan_limit_reached' && (
            <>
              <p>Has alcanzado el máximo de anuncios activos de tu plan.</p>
              <Link href="/profesionales" className="btn btn-primary">
                Mejorar plan
              </Link>
            </>
          )}
          {err && <p className="notice notice-err">{err}</p>}
          <p>
            <Link href="/cuenta">Ir a mis anuncios</Link>
          </p>
        </div>
      </div>
    );

  return (
    <div className="container narrow-lg">
      <h1>Publicar anuncio</h1>
      {profile?.account_type === 'particular' && !profile.free_ad_used && (
        <p className="notice notice-ok">Tu primer anuncio es gratis (60 días de publicación).</p>
      )}
      <form onSubmit={submit} className="form panel">
        <div className="seg">
          <button type="button" className={f.operation === 'venta' ? 'on' : ''} onClick={() => set('operation', 'venta')}>Venta</button>
          <button type="button" className={f.operation === 'alquiler' ? 'on' : ''} onClick={() => set('operation', 'alquiler')}>Alquiler</button>
        </div>

        <label className="field">Tipo de inmueble
          <select value={f.property_type} onChange={(e) => set('property_type', e.target.value)}>
            {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>

        <label className="field">Título del anuncio
          <input required maxLength={120} value={f.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="Ej. Piso luminoso de 3 habitaciones en el centro" />
        </label>

        <div className="field-row">
          <label className="field">Provincia
            <select required value={f.province || ''} onChange={(e) => set('province', e.target.value)}>
              <option value="">Selecciona</option>
              {PROVINCES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="field">Población
            <input required value={f.city || ''} onChange={(e) => set('city', e.target.value)} />
          </label>
        </div>
        <div className="field-row">
          <label className="field">Barrio / zona
            <input value={f.district || ''} onChange={(e) => set('district', e.target.value)} />
          </label>
          <label className="field">Calle
            <input value={f.street || ''} onChange={(e) => set('street', e.target.value)} />
          </label>
        </div>
        <label className="check"><input type="checkbox" checked={f.show_exact_address} onChange={(e) => set('show_exact_address', e.target.checked)} /> Mostrar la calle en el anuncio</label>

        <label className="field">Precio ({f.operation === 'alquiler' ? '€/mes' : '€'})
          <input required type="number" min="0" value={f.price || ''} onChange={(e) => set('price', e.target.value)} />
        </label>

        <div className="field-row">
          <label className="field">Habitaciones<input type="number" min="0" value={f.bedrooms ?? ''} onChange={(e) => set('bedrooms', e.target.value)} /></label>
          <label className="field">Baños<input type="number" min="0" value={f.bathrooms ?? ''} onChange={(e) => set('bathrooms', e.target.value)} /></label>
        </div>
        <div className="field-row">
          <label className="field">m² construidos<input type="number" min="0" value={f.built_area ?? ''} onChange={(e) => set('built_area', e.target.value)} /></label>
          <label className="field">m² útiles<input type="number" min="0" value={f.useful_area ?? ''} onChange={(e) => set('useful_area', e.target.value)} /></label>
        </div>
        <div className="field-row">
          <label className="field">Planta<input value={f.floor || ''} onChange={(e) => set('floor', e.target.value)} /></label>
          <label className="field">Año de construcción<input type="number" min="1800" max="2100" value={f.year_built ?? ''} onChange={(e) => set('year_built', e.target.value)} /></label>
        </div>
        <div className="field-row">
          <label className="field">Estado
            <select value={f.condition || ''} onChange={(e) => set('condition', e.target.value)}>
              <option value="">Sin indicar</option>
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="field">Certificado energético
            <select value={f.energy_cert || ''} onChange={(e) => set('energy_cert', e.target.value)}>
              <option value="">Sin indicar</option>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'En trámite', 'Exento'].map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
        </div>

        <fieldset className="field">
          <legend>Características</legend>
          <div className="checks">
            {FEATURES.map((ft) => (
              <label key={ft} className="check"><input type="checkbox" checked={f.features.includes(ft)} onChange={() => toggleFeature(ft)} /> {ft}</label>
            ))}
          </div>
        </fieldset>

        <label className="field">Descripción
          <textarea rows={7} value={f.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Describe el inmueble, la zona y las condiciones" />
        </label>

        <label className="field">Fotos (hasta {MAX_PHOTOS}, máx. {MAX_MB} MB cada una)
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, MAX_PHOTOS))} />
        </label>
        {files.length > 0 && <p className="muted small">{files.length} foto(s) seleccionada(s). La primera será la portada.</p>}

        {err && <p className="notice notice-err">{err}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Publicando…' : 'Publicar anuncio'}
        </button>
        <p className="muted small">Al publicar aceptas las condiciones de uso. El anuncio se muestra públicamente.</p>
      </form>
    </div>
  );
}
