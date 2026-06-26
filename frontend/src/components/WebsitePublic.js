import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function formatPrice(p) {
  if (!p) return '';
  return Number(p).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function PropertyCard({ prop, showPrices, accentColor, primaryColor }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)'; }}
    >
      <div style={{ height: 180, background: `linear-gradient(135deg, ${primaryColor}, #1a3a5c)`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, left: 10, background: accentColor, color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
          {prop.transaction_type === 'sale' ? 'Venta' : 'Alquiler'}
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#111', lineHeight: 1.3 }}>{prop.title}</h3>
        <p style={{ margin: '0 0 10px', color: '#6b7280', fontSize: '0.85rem' }}>📍 {prop.city}{prop.province ? `, ${prop.province}` : ''}</p>
        <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem', color: '#555', marginBottom: 12 }}>
          {prop.bedrooms && <span>🛏 {prop.bedrooms} hab.</span>}
          {prop.bathrooms && <span>🚿 {prop.bathrooms} baños</span>}
          {prop.square_meters && <span>📐 {prop.square_meters} m²</span>}
        </div>
        {showPrices && prop.price && (
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: accentColor }}>{formatPrice(prop.price)}</div>
        )}
      </div>
    </div>
  );
}

function TemplateModerno({ settings, properties }) {
  const { primaryColor = '#003366', accentColor = '#2ECC71', companyName, tagline, description, phone, whatsapp, email, address, showPrices } = settings;
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f9f9f9', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: primaryColor, padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{companyName || 'Mi Agencia'}</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          {phone && <a href={`tel:${phone}`} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '0.9rem' }}>📞 {phone}</a>}
          {whatsapp && <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} style={{ background: '#25d366', color: 'white', padding: '6px 14px', borderRadius: 20, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }} target="_blank" rel="noreferrer">WhatsApp</a>}
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0d1b2a 100%)`, padding: '80px 40px', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>{tagline || 'Tu hogar ideal te espera'}</h2>
        {description && <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: 600, margin: '0 auto 32px' }}>{description}</p>}
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ background: accentColor, color: 'white', padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', display: 'inline-block' }}>
            Contactar por WhatsApp
          </a>
        )}
      </div>

      {/* Properties */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ textAlign: 'center', color: primaryColor, fontSize: '2rem', marginBottom: 40 }}>Nuestras propiedades</h2>
        {properties.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af' }}>Próximamente publicaremos propiedades disponibles.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {properties.map(p => <PropertyCard key={p.id} prop={p} showPrices={showPrices} accentColor={accentColor} primaryColor={primaryColor} />)}
          </div>
        )}
      </div>

      {/* Contact */}
      <div style={{ background: primaryColor, color: 'white', padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>¿Hablamos?</h2>
        <p style={{ opacity: 0.85, marginBottom: 28 }}>Estamos aquí para ayudarte a encontrar tu propiedad ideal</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', fontSize: '0.95rem' }}>
          {phone && <span>📞 {phone}</span>}
          {email && <span>✉️ {email}</span>}
          {address && <span>📍 {address}</span>}
        </div>
      </div>
    </div>
  );
}

function TemplateClasico({ settings, properties }) {
  const { primaryColor = '#003366', accentColor = '#2ECC71', companyName, tagline, description, phone, whatsapp, email, address, showPrices } = settings;
  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f8f5f0', minHeight: '100vh' }}>
      <header style={{ background: primaryColor, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.6rem', letterSpacing: 1 }}>{companyName || 'Mi Agencia'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>Servicios Inmobiliarios</p>
        </div>
        {phone && <a href={`tel:${phone}`} style={{ color: 'white', textDecoration: 'none' }}>📞 {phone}</a>}
      </header>

      <div style={{ borderBottom: `5px solid ${accentColor}`, background: 'white', padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', color: primaryColor, marginBottom: 12 }}>{tagline || 'Tu hogar ideal te espera'}</h2>
        {description && <p style={{ color: '#555', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>{description}</p>}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '50px 24px' }}>
        <h2 style={{ textAlign: 'center', color: primaryColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: 12, display: 'inline-block', marginBottom: 40 }}>Propiedades Disponibles</h2>
        {properties.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>Próximamente publicaremos propiedades disponibles.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
            {properties.map(p => <PropertyCard key={p.id} prop={p} showPrices={showPrices} accentColor={accentColor} primaryColor={primaryColor} />)}
          </div>
        )}
      </div>

      <footer style={{ background: primaryColor, color: 'white', padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 16 }}>
          {phone && <span>📞 {phone}</span>}
          {email && <span>✉️ {email}</span>}
          {address && <span>📍 {address}</span>}
          {whatsapp && <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} style={{ background: '#25d366', color: 'white', padding: '6px 16px', borderRadius: 20, textDecoration: 'none' }} target="_blank" rel="noreferrer">WhatsApp</a>}
        </div>
        <p style={{ opacity: 0.6, fontSize: '0.8rem', margin: 0 }}>© {new Date().getFullYear()} {companyName}. Creado con HabitaClick.</p>
      </footer>
    </div>
  );
}

function TemplateMinimalista({ settings, properties }) {
  const { primaryColor = '#003366', accentColor = '#2ECC71', companyName, tagline, description, phone, whatsapp, email, address, showPrices } = settings;
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: 'white', minHeight: '100vh' }}>
      <header style={{ borderBottom: `2px solid ${accentColor}`, padding: '20px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: primaryColor, margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: -0.5 }}>{companyName || 'Mi Agencia'}</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {phone && <a href={`tel:${phone}`} style={{ color: '#555', textDecoration: 'none', fontSize: '0.9rem' }}>{phone}</a>}
          {whatsapp && <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} style={{ background: primaryColor, color: 'white', padding: '8px 18px', borderRadius: 6, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }} target="_blank" rel="noreferrer">Contactar</a>}
        </div>
      </header>

      <div style={{ padding: '80px 60px', maxWidth: 700 }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#111', lineHeight: 1.1, marginBottom: 16 }}>{tagline || 'Tu hogar ideal te espera'}</h2>
        {description && <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 32 }}>{description}</p>}
        <a href={`#propiedades`} style={{ background: accentColor, color: 'white', padding: '12px 28px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>Ver propiedades</a>
      </div>

      <div id="propiedades" style={{ background: '#f9fafb', padding: '60px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ color: '#111', fontSize: '1.5rem', marginBottom: 32 }}>Propiedades</h2>
          {properties.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Próximamente publicaremos propiedades disponibles.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {properties.map(p => <PropertyCard key={p.id} prop={p} showPrices={showPrices} accentColor={accentColor} primaryColor={primaryColor} />)}
            </div>
          )}
        </div>
      </div>

      <footer style={{ padding: '40px 60px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', color: '#6b7280', fontSize: '0.9rem' }}>
          {phone && <span>{phone}</span>}
          {email && <span>{email}</span>}
          {address && <span>{address}</span>}
        </div>
        <p style={{ color: '#d1d5db', fontSize: '0.75rem', marginTop: 12 }}>© {new Date().getFullYear()} {companyName} · Powered by HabitaClick</p>
      </footer>
    </div>
  );
}

const TEMPLATES = { moderno: TemplateModerno, clasico: TemplateClasico, minimalista: TemplateMinimalista };

export default function WebsitePublic({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/public/website/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError('Error al cargar la página'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0d1b2a', color: 'white', fontFamily: 'sans-serif' }}>
      Cargando...
    </div>
  );

  if (error || !data) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9f9f9', fontFamily: 'sans-serif', gap: 12 }}>
      <div style={{ fontSize: '3rem' }}>🏠</div>
      <h2 style={{ color: '#003366' }}>Página no encontrada</h2>
      <p style={{ color: '#6b7280' }}>Esta agencia no tiene página publicada todavía.</p>
    </div>
  );

  const Template = TEMPLATES[data.settings?.template] || TemplateModerno;
  return <Template settings={data.settings} properties={data.properties || []} />;
}
