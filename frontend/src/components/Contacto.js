import React, { useState } from 'react';
import { Mail, Clock, CheckCircle2 } from 'lucide-react';

function Contacto({ onBack }) {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const labelStyle = { display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151', fontSize: '0.9rem' };
  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <button onClick={onBack} style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000, padding: '10px 20px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>
        ← Volver
      </button>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '100px 2rem 4rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#003366', marginBottom: '0.5rem' }}>Contacto</h1>
        <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '1.05rem' }}>Estamos aquí para ayudarte. Escríbenos y te respondemos en menos de 24 horas.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', color: '#003366' }}><Mail size={28}/></div>
            <div style={{ fontWeight: '600', color: '#003366', marginBottom: '0.25rem' }}>Email</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>hola@habitaclick.es</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', color: '#003366' }}><Clock size={28}/></div>
            <div style={{ fontWeight: '600', color: '#003366', marginBottom: '0.25rem' }}>Respuesta</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>En menos de 24h</div>
          </div>
        </div>

        {sent ? (
          <div style={{ background: '#f0fdf4', border: '2px solid #2ECC71', borderRadius: '12px', padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', color: '#2ECC71' }}><CheckCircle2 size={48}/></div>
            <h2 style={{ color: '#003366', marginBottom: '0.5rem' }}>¡Mensaje enviado!</h2>
            <p style={{ color: '#555' }}>Nos pondremos en contacto contigo lo antes posible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Nombre</label>
              <input style={inputStyle} type="text" required placeholder="Tu nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" required placeholder="tu@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Mensaje</label>
              <textarea style={{ ...inputStyle, height: '140px', resize: 'vertical' }} required placeholder="¿En qué podemos ayudarte?" value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '0.9rem', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
              Enviar mensaje
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Contacto;
