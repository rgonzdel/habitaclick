'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function Header() {
  const { session, profile, loading, signOut } = useAuth();
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          Habita<span>click</span>
        </Link>
        <nav className="nav">
          <Link href="/buscar?operation=venta">Comprar</Link>
          <Link href="/buscar?operation=alquiler">Alquilar</Link>
          <Link href="/profesionales">Profesionales</Link>
        </nav>
        <div className="header-actions">
          {!loading && session ? (
            <>
              <Link href="/cuenta" className="btn btn-ghost">
                {profile?.full_name?.split(' ')[0] || 'Mi cuenta'}
              </Link>
              <button className="btn btn-ghost" onClick={signOut}>
                Salir
              </button>
            </>
          ) : (
            <Link href="/acceso" className="btn btn-ghost">
              Acceder
            </Link>
          )}
          <Link href="/publicar" className="btn btn-primary">
            Publicar anuncio
          </Link>
        </div>
      </div>
    </header>
  );
}
