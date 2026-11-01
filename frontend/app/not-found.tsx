import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container narrow">
      <div className="panel center">
        <h1>Página no encontrada</h1>
        <p>El anuncio o la página que buscas ya no está disponible.</p>
        <Link href="/buscar?operation=venta" className="btn btn-primary">
          Buscar inmuebles
        </Link>
      </div>
    </div>
  );
}
