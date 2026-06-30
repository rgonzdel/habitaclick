import React from 'react';

function SobreNosotros({ onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <button onClick={onBack} style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000, padding: '10px 20px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>
        ← Volver
      </button>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 2rem 4rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#003366', marginBottom: '0.5rem' }}>Sobre nosotros</h1>
        <p style={{ color: '#2ECC71', fontWeight: '600', marginBottom: '2rem', fontSize: '1.1rem' }}>Simplificando el sector inmobiliario en España</p>

        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '2rem', borderLeft: '4px solid #2ECC71' }}>
          <h2 style={{ color: '#003366', marginBottom: '1rem' }}>Nuestra misión</h2>
          <p style={{ color: '#555', lineHeight: '1.8' }}>
            HabitaClick nació con un objetivo claro: eliminar las horas que las agencias inmobiliarias pierden publicando manualmente en cada portal. Creemos que los profesionales inmobiliarios deberían dedicar su tiempo a lo que realmente importa — sus clientes — no a copiar y pegar información entre plataformas.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '2rem', borderLeft: '4px solid #003366' }}>
          <h2 style={{ color: '#003366', marginBottom: '1rem' }}>Qué hacemos</h2>
          <p style={{ color: '#555', lineHeight: '1.8' }}>
            Somos una plataforma SaaS especializada en la sincronización automática de propiedades inmobiliarias. Con HabitaClick, publicas una vez y llegamos a Idealista, Fotocasa, Vivanuncios y más portales simultáneamente. Cualquier cambio — precio, estado, fotos — se refleja en tiempo real en todos los portales.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { num: '90%', text: 'Ahorro en tiempo de publicación' },
            { num: '5+', text: 'Portales sincronizados' },
            { num: '45 días', text: 'Prueba gratuita sin compromiso' },
            { num: '24/7', text: 'Soporte para clientes Enterprise' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2ECC71' }}>{item.num}</div>
              <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>{item.text}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#003366', borderRadius: '12px', padding: '2rem', color: 'white', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>¿Quieres saber más?</h2>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>Prueba HabitaClick gratis durante 45 días sin necesidad de tarjeta de crédito.</p>
          <button onClick={onBack} style={{ background: '#2ECC71', color: 'white', border: 'none', padding: '0.85rem 2rem', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
            Comenzar prueba gratuita
          </button>
        </div>
      </div>
    </div>
  );
}

export default SobreNosotros;
