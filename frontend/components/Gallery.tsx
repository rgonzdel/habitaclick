'use client';

import { useState } from 'react';

export default function Gallery({ photos, title }: { photos: { id: string; url: string }[]; title: string }) {
  const [i, setI] = useState(0);
  if (!photos.length) return <div className="gallery-empty">Este anuncio no tiene fotos</div>;
  const go = (d: number) => setI((i + d + photos.length) % photos.length);
  return (
    <div className="gallery">
      <div className="gallery-main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[i].url} alt={`${title} - foto ${i + 1}`} />
        {photos.length > 1 && (
          <>
            <button className="g-prev" onClick={() => go(-1)} aria-label="Anterior">
              ‹
            </button>
            <button className="g-next" onClick={() => go(1)} aria-label="Siguiente">
              ›
            </button>
            <span className="photo-count">
              {i + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbs">
          {photos.map((p, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.url} alt="" className={idx === i ? 'on' : ''} onClick={() => setI(idx)} />
          ))}
        </div>
      )}
    </div>
  );
}
