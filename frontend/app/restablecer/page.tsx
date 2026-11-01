'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

// Destino del enlace "Restablece tu contraseña": el enlace inicia una sesión temporal y aquí se elige la nueva.
export default function Restablecer() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pass.length < 8) return setMsg({ type: 'err', text: 'La contraseña debe tener al menos 8 caracteres' });
    if (pass !== pass2) return setMsg({ type: 'err', text: 'Las contraseñas no coinciden' });
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password: pass });
    setBusy(false);
    if (error) return setMsg({ type: 'err', text: 'No se pudo cambiar la contraseña. Pide un enlace nuevo.' });
    setMsg({ type: 'ok', text: 'Contraseña cambiada. Te llevamos a tu cuenta…' });
    setTimeout(() => router.push('/cuenta'), 1200);
  }

  if (loading) return <div className="container narrow"><p>Cargando…</p></div>;

  if (!session)
    return (
      <div className="container narrow">
        <div className="panel center">
          <h1>Enlace caducado</h1>
          <p>El enlace para cambiar la contraseña ya no es válido. Pide uno nuevo desde la pantalla de acceso.</p>
          <Link href="/acceso" className="btn btn-primary">Ir a acceder</Link>
        </div>
      </div>
    );

  return (
    <div className="container narrow">
      <div className="panel">
        <h1 style={{ marginTop: 0 }}>Elige tu nueva contraseña</h1>
        <form onSubmit={submit} className="form">
          <input required type="password" minLength={8} placeholder="Nueva contraseña (mín. 8 caracteres)" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="new-password" />
          <input required type="password" minLength={8} placeholder="Repite la contraseña" value={pass2} onChange={(e) => setPass2(e.target.value)} autoComplete="new-password" />
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Guardando…' : 'Guardar contraseña'}</button>
          {msg && <p className={`notice notice-${msg.type}`}>{msg.text}</p>}
        </form>
      </div>
    </div>
  );
}
