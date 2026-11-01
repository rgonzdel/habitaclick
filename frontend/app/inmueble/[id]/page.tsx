import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase';
import Gallery from '@/components/Gallery';
import ContactForm from '@/components/ContactForm';
import FavoriteButton from '@/components/FavoriteButton';
import AdSlot from '@/components/AdSlot';
import ViewCounter from './ViewCounter';
import { priceLabel, dateEs, SITE_URL } from '@/lib/format';
import { typeLabel, CONDITIONS } from '@/lib/constants';

export const revalidate = 60;

async function getListing(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sb = supabaseServer();
  const { data: l } = await sb.from('listings_ranked').select('*').eq('id', id).maybeSingle();
  if (!l) return null;
  const { data: photos } = await sb.from('listing_photos').select('id, url').eq('listing_id', id).order('sort_order');
  return { l, photos: photos || [] };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const r = await getListing(params.id);
  if (!r) return { title: 'Anuncio no disponible' };
  const { l, photos } = r;
  return {
    title: `${l.title} - ${l.city}`,
    description: `${typeLabel(l.property_type)} en ${l.operation} en ${l.city}, ${l.province}. ${priceLabel(l)}. ${(l.description || '').slice(0, 120)}`,
    openGraph: photos[0] ? { images: [photos[0].url] } : undefined,
    alternates: { canonical: `${SITE_URL}/inmueble/${l.id}` },
  };
}

export default async function Inmueble({ params }: { params: { id: string } }) {
  const r = await getListing(params.id);
  if (!r) notFound();
  const { l, photos } = r!;
  const cond = CONDITIONS.find((c) => c.value === l.condition)?.label;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: l.title,
    description: l.description,
    url: `${SITE_URL}/inmueble/${l.id}`,
    datePosted: l.published_at,
    image: photos.map((p: any) => p.url),
    offers: { '@type': 'Offer', price: l.price, priceCurrency: 'EUR' },
    address: { '@type': 'PostalAddress', addressLocality: l.city, addressRegion: l.province, addressCountry: 'ES' },
  };

  return (
    <div className="container detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ViewCounter id={l.id} />
      <div className="detail-main">
        <Gallery photos={photos} title={l.title} />
        <div className="detail-head">
          <div>
            <h1>{l.title}</h1>
            <p className="muted">
              {typeLabel(l.property_type)} · {l.show_exact_address && l.street ? `${l.street}, ` : ''}
              {l.district ? `${l.district}, ` : ''}
              {l.city} ({l.province})
            </p>
          </div>
          <div className="detail-price">
            {priceLabel(l)}
            <FavoriteButton listingId={l.id} />
          </div>
        </div>

        <div className="facts">
          {l.bedrooms != null && <div><b>{l.bedrooms}</b> habitaciones</div>}
          {l.bathrooms != null && <div><b>{l.bathrooms}</b> baños</div>}
          {l.built_area != null && <div><b>{Number(l.built_area)}</b> m² construidos</div>}
          {l.useful_area != null && <div><b>{Number(l.useful_area)}</b> m² útiles</div>}
          {l.floor && <div>Planta <b>{l.floor}</b></div>}
          {l.year_built && <div>Año <b>{l.year_built}</b></div>}
          {cond && <div>{cond}</div>}
          {l.energy_cert && <div>Certificado energético <b>{l.energy_cert}</b></div>}
        </div>

        {l.description && (
          <section>
            <h2>Descripción</h2>
            <p className="prewrap">{l.description}</p>
          </section>
        )}

        {l.features?.length > 0 && (
          <section>
            <h2>Características</h2>
            <ul className="tags">
              {l.features.map((f: string) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="muted small">Publicado el {dateEs(l.published_at)} · {l.views} visitas</p>
      </div>

      <aside className="detail-side">
        <div className="owner">
          Anunciante: <b>{l.owner_type === 'profesional' ? l.owner_company || 'Profesional' : 'Particular'}</b>
        </div>
        <ContactForm listingId={l.id} title={l.title} />
        <AdSlot placement="listing_sidebar" />
      </aside>
    </div>
  );
}
