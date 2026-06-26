import React, { useState, useRef, useEffect } from 'react';
import './Auth.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Login({ onLoginSuccess, onBackToLanding }) {
  const [step, setStep] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowLoad, setSlowLoad] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [devCode, setDevCode] = useState('');
  const codeRefs = useRef([]);

  useEffect(() => { setError(''); }, [step]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSlowLoad(false);
    setError('');
    const slowTimer = setTimeout(() => setSlowLoad(true), 3000);
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      } else {
        setError(data.error || 'Email o contraseña incorrectos');
      }
    } catch {
      setError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.');
    }
    clearTimeout(slowTimer);
    setSlowLoad(false);
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.devCode) setDevCode(data.devCode);
        setStep('code');
      } else {
        setError(data.error || 'Error al enviar el correo.');
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    }
    setLoading(false);
  };

  const handleCodeChange = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (v && i < 5) codeRefs.current[i + 1]?.focus();
  };

  const handleCodeKey = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) codeRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) codeRefs.current[i + 1]?.focus();
  };

  const handleCodePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setCode(pasted.split('')); codeRefs.current[5]?.focus(); }
    e.preventDefault();
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const codeStr = code.join('');
    if (codeStr.length < 6) { setError('Introduce los 6 dígitos del código'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/v1/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: codeStr })
      });
      const data = await res.json();
      if (res.ok) { setStep('newpass'); }
      else { setError(data.error || 'Código incorrecto'); }
    } catch { setError('Error de conexión.'); }
    setLoading(false);
  };

  const handleResetPass = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (newPass !== newPass2) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: code.join(''), newPassword: newPass })
      });
      const data = await res.json();
      if (res.ok) { setStep('done'); }
      else { setError(data.error || 'Error al cambiar la contraseña'); }
    } catch { setError('Error de conexión.'); }
    setLoading(false);
  };

  const renderError = () => error ? (
    <div className="auth-error">
      <span className="auth-error-icon">!</span>
      {error}
    </div>
  ) : null;

  const renderCard = () => {
    if (step === 'login') return (
      <>
        <h2>Iniciar sesión</h2>
        <button className="back-btn" onClick={onBackToLanding}>← Volver al inicio</button>
        {renderError()}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <div className="auth-pass-wrap">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required autoComplete="current-password"
            />
            <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(s => !s)}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
          {slowLoad && (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginTop: '0.75rem' }}>
              ⏳ Iniciando servidor, un momento...
            </p>
          )}
        </form>
        <button className="auth-forgot-link" onClick={() => { setForgotEmail(email); setStep('forgot'); }}>
          ¿Olvidaste tu contraseña?
        </button>
      </>
    );

    if (step === 'forgot') return (
      <>
        <div className="auth-step-header">
          <button className="auth-back-step" onClick={() => setStep('login')}>←</button>
          <h2>Recuperar contraseña</h2>
        </div>
        <p className="auth-subtitle">Te enviaremos un código de 6 dígitos a tu correo.</p>
        {renderError()}
        <form onSubmit={handleForgot}>
          <input type="email" placeholder="Tu email" value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)} required autoFocus />
          <button type="submit" disabled={loading}>{loading ? 'Enviando…' : 'Enviar código'}</button>
        </form>
      </>
    );

    if (step === 'code') return (
      <>
        <div className="auth-step-header">
          <button className="auth-back-step" onClick={() => setStep('forgot')}>←</button>
          <h2>Código de verificación</h2>
        </div>
        {devCode ? (
          <div className="auth-devcode">
            <span className="auth-devcode-label">⚠ SMTP no configurado — código de prueba:</span>
            <span className="auth-devcode-value">{devCode}</span>
          </div>
        ) : (
          <p className="auth-subtitle">
            Hemos enviado un código a <strong>{forgotEmail}</strong>.<br />
            Revisa también la carpeta de spam.
          </p>
        )}
        {renderError()}
        <form onSubmit={handleVerifyCode}>
          <div className="auth-otp-wrap" onPaste={handleCodePaste}>
            {code.map((d, i) => (
              <input
                key={i}
                ref={el => codeRefs.current[i] = el}
                className="auth-otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleCodeChange(i, e.target.value)}
                onKeyDown={e => handleCodeKey(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>
          <button type="submit" disabled={loading || code.join('').length < 6}>
            {loading ? 'Verificando…' : 'Verificar código'}
          </button>
        </form>
        <button className="auth-forgot-link" onClick={() => { setCode(['','','','','','']); handleForgot({ preventDefault: () => {} }); }}>
          Reenviar código
        </button>
      </>
    );

    if (step === 'newpass') return (
      <>
        <div className="auth-step-header">
          <span className="auth-step-icon">🔒</span>
          <h2>Nueva contraseña</h2>
        </div>
        <p className="auth-subtitle">Elige una contraseña segura de al menos 6 caracteres.</p>
        {renderError()}
        <form onSubmit={handleResetPass}>
          <input type="password" placeholder="Nueva contraseña" value={newPass}
            onChange={e => setNewPass(e.target.value)} required autoFocus minLength={6} />
          <input type="password" placeholder="Repite la contraseña" value={newPass2}
            onChange={e => setNewPass2(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Guardando…' : 'Cambiar contraseña'}</button>
        </form>
      </>
    );

    if (step === 'done') return (
      <>
        <div className="auth-success-icon">✓</div>
        <h2>¡Contraseña actualizada!</h2>
        <p className="auth-subtitle">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <button className="auth-btn-full" onClick={() => {
          setStep('login'); setEmail(forgotEmail);
          setPassword(''); setCode(['','','','','','']);
          setNewPass(''); setNewPass2('');
        }}>
          Ir a iniciar sesión
        </button>
      </>
    );
  };

  return (
    <div className="auth-container">
      <video className="auth-video" autoPlay muted loop playsInline>
        <source src="/videos/VideoLandingMadrid.mp4" type="video/mp4" />
      </video>
      <div className="auth-overlay" />
      <div className="auth-card">{renderCard()}</div>
    </div>
  );
}

export default Login;
