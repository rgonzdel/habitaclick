import Link from 'next/link';
import FavoriteButton from './FavoriteButton';
import { priceLabel } from '@/lib/format';
import { typeLabel } from '@/lib/constants';

export default function ListingCard({ l }: { l: any }) {
  return (
    <Link href={`/inmueble/${l.id}`} className={`card ${l.is_top ? 'card-top' : ''}`}>
      <div className="card-img">
        {l.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={l.cover_url} alt={l.title} loading="lazy" />
        ) : (
          <div className="card-noimg">Sin foto</div>
        )}
        {(l.is_top || l.is_highlight) && <span className="badge">{l.is_top ? 'Top' : 'Destacado'}</span>}
        {l.photo_count > 1 && <span className="photo-count">{l.photo_count} fotos</span>}
        <FavoriteButton listingId={l.id} />
      </div>
      <div className="card-body">
        <div className="card-price">{priceLabel(l)}</div>
        <div className="card-title">{l.title}</div>
        <div className="card-loc">
          {typeLabel(l.property_type)} · {l.district ? `${l.district}, ` : ''}
          {l.city} ({l.province})
        </div>
        <div className="card-feats">
          {l.bedrooms != null && <span>{l.bedrooms} hab.</span>}
          {l.bathrooms != null && <span>{l.bathrooms} baños</span>}
          {l.built_area != null && <span>{Number(l.built_area)} m²</span>}
        </div>
        <div className="card-owner">{l.owner_type === 'profesional' ? l.owner_company || 'Profesional' : 'Particular'}</div>
      </div>
    </Link>
  );
}
