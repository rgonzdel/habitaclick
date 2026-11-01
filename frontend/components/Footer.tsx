import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="logo">
            <Logo variant="dark" />
          </div>
          <p className="muted-light">El portal de anuncios inmobiliarios. Tu primer anuncio como particular es gratis.</p>
        </div>
        <div>
          <h4>Buscar</h4>
          <Link href="/buscar?operation=venta">Comprar</Link>
          <Link href="/buscar?operation=alquiler">Alquilar</Link>
        </div>
        <div>
          <h4>Anunciar</h4>
          <Link href="/publicar">Publicar anuncio</Link>
          <Link href="/profesionales">Planes para profesionales</Link>
        </div>
        <div>
          <h4>Legal</h4>
          <Link href="/legal/privacidad">Privacidad</Link>
          <Link href="/legal/cookies">Cookies</Link>
          <Link href="/legal/aviso-legal">Aviso legal</Link>
        </div>
      </div>
      <div className="container footer-copy">© {new Date().getFullYear()} Habitaclick</div>
    </footer>
  );
}
