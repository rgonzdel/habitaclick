'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export default function ContactForm({ listingId, title }: { listingId: string; title: string }) {
  const { session, profile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(`Hola, me interesa el anuncio "${title}". ¿Podemos hablar?`);
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    const { error } = await supabaseBrowser()
      .from('leads')
      .insert({
        listing_id: listingId,
        sender_user_id: session?.user.id ?? null,
        name: name || profile?.full_name || 'Interesado',
        email: email || session?.user.email || '',
        phone: phone || null,
        message,
      });
    setState(error ? 'error' : 'ok');
  }

  if (state === 'ok') return <p className="notice notice-ok">Mensaje enviado. El anunciante te responderá por correo o teléfono.</p>;

  return (
    <form onSubmit={submit} className="contact">
      <h3>Contactar con el anunciante</h3>
      <input required placeholder="Nombre" defaultValue={profile?.full_name || ''} onChange={(e) => setName(e.target.value)} />
      <input required type="email" placeholder="Correo electrónico" defaultValue={session?.user.email || ''} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Teléfono (opcional)" onChange={(e) => setPhone(e.target.value)} />
      <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
      <button className="btn btn-primary btn-block" disabled={state === 'sending'}>
        {state === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
      </button>
      {state === 'error' && <p className="notice notice-err">No se pudo enviar. Inténtalo de nuevo.</p>}
    </form>
  );
}
