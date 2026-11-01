'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';

function AccesoForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/cuenta';
  const [mode, setMode] = useState<'login' | 'signup'>(params.get('modo') === 'registro' ? 'signup' : 'login');
  const [accountType, setAccountType] = useState<'particular' | 'profesional'>('particular');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [accept, setAccept] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const sb = supabaseBrowser();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === 'login') {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) setMsg({ type: 'err', text: 'Correo o contraseña incorrectos' });
      else router.push(next);
    } else {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, account_type: accountType, company_name: accountType === 'profesional' ? company : null, marketing_opt_in: marketing },
          emailRedirectTo: window.location.origin + next,
        },
      });
      if (error) setMsg({ type: 'err', text: error.message });
      else if (data.session) router.push(next);
      else setMsg({ type: 'ok', text: 'Cuenta creada. Revisa tu correo para confirmarla y vuelve aquí para entrar.' });
    }
    setBusy(false);
  }

  async function reset() {
    if (!email) return setMsg({ type: 'err', text: 'Escribe tu correo primero' });
    await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/cuenta' });
    setMsg({ type: 'ok', text: 'Si el correo existe, recibirás un enlace para restablecer la contraseña.' });
  }

  return (
    <div className="container narrow">
      <div className="panel">
        <div className="tabs">
          <button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')} type="button">
            Acceder
          </button>
          <button className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')} type="button">
            Crear cuenta
          </button>
        </div>
        <form onSubmit={submit} className="form">
          {mode === 'signup' && (
            <>
              <div className="seg">
                <button type="button" className={accountType === 'particular' ? 'on' : ''} onClick={() => setAccountType('particular')}>
                  Particular
                </button>
                <button type="button" className={accountType === 'profesional' ? 'on' : ''} onClick={() => setAccountType('profesional')}>
                  Profesional / inmobiliaria
                </button>
              </div>
              <input required placeholder="Nombre y apellidos" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              {accountType === 'profesional' && (
                <input required placeholder="Nombre de la empresa" value={company} onChange={(e) => setCompany(e.target.value)} />
              )}
            </>
          )}
          <input required type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" minLength={8} placeholder="Contraseña (mín. 8 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} />
          {mode === 'signup' && (
            <>
              <label className="check small">
                <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} required /> Acepto la política de privacidad y las condiciones de uso.
              </label>
              <label className="check small">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Quiero recibir novedades y ofertas por email.
              </label>
            </>
          )}
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
          {mode === 'login' && (
            <button type="button" className="link" onClick={reset}>
              He olvidado mi contraseña
            </button>
          )}
          {msg && <p className={`notice notice-${msg.type}`}>{msg.text}</p>}
        </form>
      </div>
    </div>
  );
}

export default function Acceso() {
  return (
    <Suspense>
      <AccesoForm />
    </Suspense>
  );
}
