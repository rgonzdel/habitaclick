import Link from 'next/link';
import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase';
import { searchListings, Filters, PAGE_SIZE } from '@/lib/search';
import { FilterPanel } from '@/components/SearchForm';
import ListingCard from '@/components/ListingCard';
import AdSlot from '@/components/AdSlot';
import SaveSearchButton from '@/components/SaveSearchButton';
import { typeLabel } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function describe(f: Filters) {
  const op = f.operation === 'alquiler' ? 'en alquiler' : 'en venta';
  const t = f.type ? typeLabel(f.type) + 's' : 'Inmuebles';
  const place = f.city || f.province;
  return `${t} ${op}${place ? ` en ${place}` : ''}`;
}

export async function generateMetadata({ searchParams }: { searchParams: Filters }): Promise<Metadata> {
  const d = describe(searchParams);
  return { title: d, description: `${d}. Compara precios, fotos y contacta directamente con el anunciante en Habitaclick.` };
}

function pageHref(f: Filters, page: number) {
  const p = new URLSearchParams();
  Object.entries({ ...f, page: String(page) }).forEach(([k, v]) => v && p.set(k, String(v)));
  return `/buscar?${p.toString()}`;
}

export default async function Buscar({ searchParams }: { searchParams: Filters }) {
  const f: Filters = { operation: 'venta', ...searchParams };
  const { listings, total, page, error } = await searchListings(supabaseServer(), f);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const saveFilters = Object.fromEntries(Object.entries(f).filter(([k, v]) => v && k !== 'page')) as Record<string, string>;

  return (
    <div className="container search-layout">
      <aside className="search-side">
        <FilterPanel f={f} />
        <AdSlot placement="search_sidebar" />
      </aside>
      <section className="search-main">
        <div className="search-head">
          <div>
            <h1>{describe(f)}</h1>
            <p className="muted">{total.toLocaleString('es-ES')} anuncios</p>
          </div>
          <SaveSearchButton filters={saveFilters} label={describe(f)} />
        </div>

        {error && <p className="notice notice-err">No se pudieron cargar los anuncios.</p>}

        {listings.length === 0 && !error ? (
          <div className="empty">
            <p>No hay anuncios con estos filtros. Prueba a ampliar la búsqueda o crea una alerta.</p>
          </div>
        ) : (
          <div className="list">
            {listings.map((l: any, i: number) => (
              <div key={l.id}>
                <ListingCard l={l} />
                {i === 4 && <AdSlot placement="search_inline" />}
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav className="pager">
            {page > 1 && <Link href={pageHref(f, page - 1)}>← Anterior</Link>}
            <span>
              Página {page} de {pages}
            </span>
            {page < pages && <Link href={pageHref(f, page + 1)}>Siguiente →</Link>}
          </nav>
        )}
      </section>
    </div>
  );
}
