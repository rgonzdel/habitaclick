'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export default function SaveSearchButton({ filters, label }: { filters: Record<string, string>; label: string }) {
  const { session } = useAuth();
  const router = useRouter();
  const [frequency, setFrequency] = useState('daily');
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle');

  async function save() {
    if (!session) return router.push('/acceso?next=' + encodeURIComponent(window.location.pathname + window.location.search));
    const { error } = await supabaseBrowser()
      .from('saved_searches')
      .insert({ user_id: session.user.id, name: label, filters, frequency });
    setState(error ? 'error' : 'ok');
  }

  if (state === 'ok') return <p className="notice notice-ok">Alerta creada. Te avisaremos por correo de los anuncios nuevos.</p>;

  return (
    <div className="save-search">
      <select value={frequency} onChange={(e) => setFrequency(e.target.value)} aria-label="Frecuencia">
        <option value="instant">Al momento</option>
        <option value="daily">Diaria</option>
        <option value="weekly">Semanal</option>
      </select>
      <button className="btn btn-outline" onClick={save}>
        Crear alerta por email
      </button>
      {state === 'error' && <span className="notice notice-err">No se pudo guardar</span>}
    </div>
  );
}
