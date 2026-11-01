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
          <h2>Cómo funciona</h2>
          <div className="steps">
            <div className="step">
              <div className="step-n">1</div>
              <h3>Busca o publica</h3>
              <p>Filtra por zona, precio y características, o crea tu anuncio en unos minutos.</p>
            </div>
            <div className="step">
              <div className="step-n">2</div>
              <h3>Contacta directo</h3>
              <p>Escribe al anunciante desde la ficha y recibe la respuesta por correo o teléfono.</p>
            </div>
            <div className="step">
              <div className="step-n">3</div>
              <h3>Cierra tu operación</h3>
              <p>Guarda favoritos y crea alertas para no perderte ningún anuncio nuevo.</p>
            </div>
          </div>
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

        <section className="section">
          <h2>Pensado para anunciar</h2>
          <div className="perks">
            <div className="perk"><b>Primer anuncio gratis</b><span>Para particulares, con fotos y 60 días de publicación.</span></div>
            <div className="perk"><b>Más visibilidad</b><span>Destaca tu anuncio o aparece entre los primeros resultados.</span></div>
            <div className="perk"><b>Alertas por email</b><span>Los compradores reciben tus anuncios nuevos al instante.</span></div>
            <div className="perk"><b>Planes profesionales</b><span>Más anuncios activos y posicionamiento para tu inmobiliaria.</span></div>
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
