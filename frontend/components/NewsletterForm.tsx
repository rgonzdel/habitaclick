'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    const { error } = await supabaseBrowser().from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });
    // 23505 = ya suscrito: lo tratamos como correcto
    setState(!error || error.code === '23505' ? 'ok' : 'error');
  }

  if (state === 'ok') return <p className="notice notice-ok">Gracias. Te enviaremos las mejores novedades.</p>;

  return (
    <form onSubmit={submit} className="newsletter">
      <div className="newsletter-row">
        <input type="email" required placeholder="Tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn btn-accent" type="submit">
          Suscribirme
        </button>
      </div>
      <label className="check small">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /> Acepto recibir comunicaciones
        comerciales y la política de privacidad.
      </label>
      {state === 'error' && <p className="notice notice-err">No se pudo completar la suscripción. Revisa el correo.</p>}
    </form>
  );
}
