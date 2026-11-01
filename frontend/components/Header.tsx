'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function Header() {
  const { session, profile, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo" onClick={close}>
          Habita<span>click</span>
        </Link>

        <nav className={`nav ${open ? 'nav-open' : ''}`} aria-label="Principal">
          <Link href="/buscar?operation=venta" onClick={close}>Comprar</Link>
          <Link href="/buscar?operation=alquiler" onClick={close}>Alquilar</Link>
          <Link href="/profesionales" onClick={close}>Profesionales</Link>
          {!loading && session && (
            <div className="nav-account">
              <Link href="/cuenta" onClick={close}>Mi cuenta</Link>
              <button
                className="link-btn"
                onClick={() => {
                  close();
                  signOut();
                }}
              >
                Salir
              </button>
            </div>
          )}
        </nav>

        <div className="header-actions">
          {!loading && session ? (
            <Link href="/cuenta" className="btn btn-ghost hide-sm">
              {profile?.full_name?.split(' ')[0] || 'Mi cuenta'}
            </Link>
          ) : (
            <Link href="/acceso" className="btn btn-ghost">Acceder</Link>
          )}
          <Link href="/publicar" className="btn btn-primary btn-publish">
            <span className="hide-sm">Publicar anuncio</span>
            <span className="show-sm">Publicar</span>
          </Link>
          <button className="menu-btn" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(!open)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
