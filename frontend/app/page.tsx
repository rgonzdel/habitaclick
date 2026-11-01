import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase';
import { searchListings } from '@/lib/search';
import { HeroSearch } from '@/components/SearchForm';
import ListingCard from '@/components/ListingCard';
import AdSlot from '@/components/AdSlot';
import NewsletterForm from '@/components/NewsletterForm';

export const revalidate = 60;

const TOP_PROVINCES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Alicante', 'Toledo', 'Zaragoza'];

export default async function Home() {
  const { listings } = await searchListings(supabaseServer(), { sort: 'relevancia' });
  const featured = listings.slice(0, 8);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Encuentra tu casa, publica la tuya</h1>
          <p>Miles de viviendas en venta y alquiler. Si eres particular, tu primer anuncio es gratis.</p>
          <HeroSearch />
        </div>
      </section>

      <div className="container">
        <AdSlot placement="home_banner" />

        <section className="section">
          <h2>Anuncios destacados</h2>
          {featured.length ? (
            <div className="grid">
              {featured.map((l: any) => (
                <ListingCard key={l.id} l={l} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>Todavía no hay anuncios publicados. Sé el primero en anunciar tu inmueble.</p>
              <Link href="/publicar" className="btn btn-primary">
                Publicar anuncio gratis
              </Link>
            </div>
          )}
        </section>

        <section className="section">
          <h2>Busca por provincia</h2>
          <div className="chips">
            {TOP_PROVINCES.map((p) => (
              <Link key={p} href={`/buscar?operation=venta&province=${encodeURIComponent(p)}`} className="chip">
                {p}
              </Link>
            ))}
          </div>
        </section>

        <section className="section cta-split">
          <div className="cta-box">
            <h3>Soy particular</h3>
            <p>Publica tu primer anuncio gratis, con fotos y contacto directo con los interesados.</p>
            <Link href="/publicar" className="btn btn-primary">
              Anunciar gratis
            </Link>
          </div>
          <div className="cta-box cta-dark">
            <h3>Soy profesional</h3>
            <p>Planes con más anuncios, mejor posicionamiento y campañas por email.</p>
            <Link href="/profesionales" className="btn btn-accent">
              Ver planes
            </Link>
          </div>
        </section>

        <section className="section newsletter-box">
          <div>
            <h2>Novedades en tu bandeja</h2>
            <p>Recibe una selección de nuevos anuncios y consejos para comprar o alquilar.</p>
          </div>
          <NewsletterForm />
        </section>
      </div>
    </>
  );
}
