'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Aparicion suave al hacer scroll. No cambia el diseño: solo anima opacidad y desplazamiento.
// Sin JavaScript, o con "reducir movimiento", todo se ve desde el principio.
const SELECTOR = '.section > h2, .step, .perk, .plan, .cta-box, .newsletter-box, .chip, .grid > .card, .list > div, .panel, .facts, .tags li';

export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => !el.dataset.rv);
    const vh = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('rv-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el, i) => {
      el.dataset.rv = '1';
      // Lo que ya se ve al cargar no se oculta, para evitar parpadeos
      if (el.getBoundingClientRect().top < vh * 0.9) return;
      const sibIndex = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : i;
      el.style.setProperty('--rv-delay', `${Math.min(sibIndex, 6) * 70}ms`);
      el.classList.add('rv');
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
