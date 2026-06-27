import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const FONT_FAMILIES = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", serif',
  montserrat: '"Montserrat", "Helvetica Neue", sans-serif',
  nunito: '"Nunito", system-ui, sans-serif',
};

const BTN_RADIUS = { square: '4px', medium: '8px', round: '30px' };

function formatPrice(p) {
  if (!p) return '';
  return Number(p).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function getSocialUrl(key, value) {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  const maps = {
    instagram: `https://instagram.com/${value.replace('@', '')}`,
    facebook: `https://facebook.com/${value}`,
    linkedin: `https://linkedin.com/company/${value.replace(/^.*linkedin\.com\/(?:company\/)?/, '')}`,
    tiktok: `https://tiktok.com/@${value.replace('@', '')}`,
    youtube: value,
  };
  return maps[key] || value;
}

function FloatingWhatsApp({ whatsapp }) {
  if (!whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
      target="_blank" rel="noreferrer"
      title="Contactar por WhatsApp"
      style={{
        position: 'fixed', bottom: 24, right: 24, width: 58, height: 58,
        background: '#25d366', borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
        textDecoration: 'none', zIndex: 9999, fontSize: '1.7rem',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
    >
      💬
    </a>
  );
}

function PropertyCard({ prop, showPrices, accentColor, primaryColor, btnRadius }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.09)', transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.09)'; }}
    >
      <div style={{ height: 180, background: `linear-gradient(135deg, ${primaryColor}, #1a3a5c)`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, left: 10, background: accentColor, color: 'white', padding: '3px 10px', borderRadius: btnRadius || '20px', fontSize: '0.75rem', fontWeight: 700 }}>
          {prop.transaction_type === 'sale' ? 'Venta' : 'Alquiler'}
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#111', lineHeight: 1.3 }}>{prop.title}</h3>
        <p style={{ margin: '0 0 10px', color: '#6b7280', fontSize: '0.85rem' }}>📍 {prop.city}{prop.province ? `, ${prop.province}` : ''}</p>
        <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem', color: '#555', marginBottom: 12 }}>
          {prop.bedrooms && <span>🛏 {prop.bedrooms}</span>}
          {prop.bathrooms && <span>🚿 {prop.bathrooms}</span>}
          {prop.square_meters && <span>📐 {prop.square_meters} m²</span>}
        </div>
        {showPrices && prop.price && (
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: accentColor }}>{formatPrice(prop.price)}</div>
        )}
      </div>
    </div>
  );
}

function ServicesSection({ settings, bg, titleColor, cardBg, cardShadow }) {
  if (!settings.showServices || !settings.services?.length) return null;
  return (
    <div style={{ background: bg || '#f9f9f9', padding: '64px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: titleColor, fontSize: '2rem', marginBottom: 40 }}>Nuestros servicios</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
          {settings.services.map((svc, i) => (
            <div key={i} style={{ background: cardBg || 'white', borderRadius: 14, padding: '28px 20px', textAlign: 'center', boxShadow: cardShadow || '0 2px 12px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{svc.icon || '🏠'}</div>
              <h3 style={{ color: titleColor, margin: '0 0 8px', fontSize: '1.05rem' }}>{svc.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>{svc.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection({ settings, bg, titleColor }) {
  if (!settings.showTestimonials || !settings.testimonials?.length) return null;
  return (
    <div style={{ background: bg || 'white', padding: '64px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: titleColor, fontSize: '2rem', marginBottom: 40 }}>Lo que dicen nuestros clientes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {settings.testimonials.map((t, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: '#f59e0b', fontSize: '1.1rem' }}>{'★'.repeat(t.rating || 5)}{'☆'.repeat(5 - (t.rating || 5))}</div>
              <p style={{ color: '#374151', fontSize: '0.95rem', lineHeight: 1.7, margin: 0, fontStyle: 'italic', flex: 1 }}>"{t.text}"</p>
              <div style={{ fontWeight: 700, color: titleColor, fontSize: '0.9rem' }}>— {t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsBar({ settings, bg, textColor }) {
  if (!settings.showStats) return null;
  const stats = [
    settings.yearsExperience && { value: settings.yearsExperience + '+', label: 'Años de experiencia' },
    settings.propertiesSold && { value: settings.propertiesSold + '+', label: 'Propiedades vendidas' },
    settings.clientsServed && { value: settings.clientsServed + '+', label: 'Clientes satisfechos' },
  ].filter(Boolean);
  if (!stats.length) return null;
  return (
    <div style={{ background: bg, padding: '48px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center', color: textColor }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapSection({ settings }) {
  if (!settings.showMap || !settings.mapUrl) return null;
  return (
    <div style={{ height: 360 }}>
      <iframe src={settings.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Mapa de ubicación" referrerPolicy="no-referrer-when-downgrade" />
    </div>
  );
}

function SocialLinks({ settings, color }) {
  const links = [
    { key: 'instagram', label: '📷 Instagram', value: settings.instagram },
    { key: 'facebook', label: '👤 Facebook', value: settings.facebook },
    { key: 'linkedin', label: '💼 LinkedIn', value: settings.linkedin },
    { key: 'tiktok', label: '🎵 TikTok', value: settings.tiktok },
    { key: 'youtube', label: '▶️ YouTube', value: settings.youtube },
  ].filter(l => l.value);
  if (!links.length) return null;
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
      {links.map(l => (
        <a key={l.key} href={getSocialUrl(l.key, l.value)} target="_blank" rel="noreferrer" style={{ color, textDecoration: 'none', fontSize: '0.88rem', opacity: 0.85 }}>
          {l.label}
        </a>
      ))}
    </div>
  );
}

function TemplateModerno({ settings, properties }) {
  const { primaryColor = '#003366', accentColor = '#2ECC71', companyName, tagline, description, aboutText,
    phone, whatsapp, email, address, scheduleText, logoUrl, heroCtaText, fontFamily, buttonRadius,
    showPrices, showHero, showAbout, showContact, showWhatsappFloat } = settings;
  const font = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.sans;
  const radius = BTN_RADIUS[buttonRadius] || '8px';

  return (
    <div style={{ fontFamily: font, background: '#f9f9f9', minHeight: '100vh' }}>
      <header style={{ background: primaryColor, padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: 12 }}>
        {logoUrl
          ? <img src={logoUrl} alt={companyName} style={{ height: 42, objectFit: 'contain' }} />
          : <h1 style={{ color: 'white', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{companyName || 'Mi Agencia'}</h1>
        }
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {phone && <a href={`tel:${phone}`} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '0.9rem' }}>📞 {phone}</a>}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} style={{ background: '#25d366', color: 'white', padding: '6px 14px', borderRadius: radius, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          )}
        </div>
      </header>

      {showHero && (
        <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0d1b2a 100%)`, padding: '80px 40px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>{tagline || 'Tu hogar ideal te espera'}</h2>
          {description && <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: 600, margin: '0 auto 32px' }}>{description}</p>}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ background: accentColor, color: 'white', padding: '14px 32px', borderRadius: radius, textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', display: 'inline-block' }}>
              {heroCtaText || 'Contactar por WhatsApp'}
            </a>
          )}
        </div>
      )}

      <StatsBar settings={settings} bg={primaryColor} textColor="white" />

      {showAbout && aboutText && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <h2 style={{ color: primaryColor, fontSize: '2rem', marginBottom: 24 }}>Sobre nosotros</h2>
          <p style={{ color: '#374151', fontSize: '1.05rem', lineHeight: 1.8 }}>{aboutText}</p>
        </div>
      )}

      <ServicesSection settings={settings} bg="#f3f4f6" titleColor={primaryColor} />

      {settings.showProperties && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
          <h2 style={{ textAlign: 'center', color: primaryColor, fontSize: '2rem', marginBottom: 40 }}>Nuestras propiedades</h2>
          {properties.length === 0
            ? <p style={{ textAlign: 'center', color: '#9ca3af' }}>Próximamente publicaremos propiedades disponibles.</p>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                {properties.map(p => <PropertyCard key={p.id} prop={p} showPrices={showPrices} accentColor={accentColor} primaryColor={primaryColor} btnRadius={radius} />)}
              </div>
          }
        </div>
      )}

      <TestimonialsSection settings={settings} bg="white" titleColor={primaryColor} />
      <MapSection settings={settings} />

      {showContact && (
        <div style={{ background: primaryColor, color: 'white', padding: '64px 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>¿Hablamos?</h2>
          <p style={{ opacity: 0.85, marginBottom: 28 }}>Estamos aquí para ayudarte a encontrar tu propiedad ideal</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', fontSize: '0.95rem' }}>
            {phone && <span>📞 {phone}</span>}
            {email && <span>✉️ {email}</span>}
            {address && <span>📍 {address}</span>}
            {scheduleText && <span>🕐 {scheduleText}</span>}
          </div>
          <SocialLinks settings={settings} color="rgba(255,255,255,0.85)" />
        </div>
      )}

      {showWhatsappFloat && <FloatingWhatsApp whatsapp={whatsapp} />}
    </div>
  );
}

function TemplateClasico({ settings, properties }) {
  const { primaryColor = '#003366', accentColor = '#2ECC71', companyName, tagline, description, aboutText,
    phone, whatsapp, email, address, scheduleText, logoUrl, heroCtaText, fontFamily, buttonRadius,
    showPrices, showHero, showAbout, showContact, showWhatsappFloat } = settings;
  const font = FONT_FAMILIES[fontFamily] || 'Georgia, serif';
  const radius = BTN_RADIUS[buttonRadius] || '8px';

  return (
    <div style={{ fontFamily: font, background: '#f8f5f0', minHeight: '100vh' }}>
      <header style={{ background: primaryColor, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          {logoUrl
            ? <img src={logoUrl} alt={companyName} style={{ height: 48, objectFit: 'contain' }} />
            : <>
                <h1 style={{ color: 'white', margin: 0, fontSize: '1.6rem', letterSpacing: 1 }}>{companyName || 'Mi Agencia'}</h1>
                <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase' }}>Servicios Inmobiliarios</p>
              </>
          }
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {phone && <a href={`tel:${phone}`} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>📞 {phone}</a>}
          {whatsapp && <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} style={{ background: '#25d366', color: 'white', padding: '6px 14px', borderRadius: radius, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }} target="_blank" rel="noreferrer">WhatsApp</a>}
        </div>
      </header>

      {showHero && (
        <div style={{ borderBottom: `5px solid ${accentColor}`, background: 'white', padding: '64px 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: primaryColor, marginBottom: 16 }}>{tagline || 'Tu hogar ideal te espera'}</h2>
          {description && <p style={{ color: '#555', maxWidth: 600, margin: '0 auto 28px', lineHeight: 1.8 }}>{description}</p>}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ background: accentColor, color: 'white', padding: '12px 28px', borderRadius: radius, textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
              {heroCtaText || 'Contactar por WhatsApp'}
            </a>
          )}
        </div>
      )}

      <StatsBar settings={settings} bg={accentColor + '22'} textColor={primaryColor} />

      {showAbout && aboutText && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
          <h2 style={{ color: primaryColor, fontSize: '1.8rem', marginBottom: 10, display: 'inline-block', borderBottom: `2px solid ${accentColor}`, paddingBottom: 8 }}>Quiénes somos</h2>
          <p style={{ color: '#444', fontSize: '1.05rem', lineHeight: 1.8, marginTop: 24 }}>{aboutText}</p>
        </div>
      )}

      <ServicesSection settings={settings} bg="white" titleColor={primaryColor} cardBg="#f8f5f0" cardShadow="0 2px 8px rgba(0,0,0,0.06)" />

      {settings.showProperties && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px' }}>
          <h2 style={{ textAlign: 'center', color: primaryColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: 12, marginBottom: 40, fontSize: '1.8rem', display: 'inline-block' }}>Propiedades Disponibles</h2>
          {properties.length === 0
            ? <p style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>Próximamente publicaremos propiedades disponibles.</p>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
                {properties.map(p => <PropertyCard key={p.id} prop={p} showPrices={showPrices} accentColor={accentColor} primaryColor={primaryColor} btnRadius={radius} />)}
              </div>
          }
        </div>
      )}

      <TestimonialsSection settings={settings} bg="#f8f5f0" titleColor={primaryColor} />
      <MapSection settings={settings} />

      {showContact && (
        <footer style={{ background: primaryColor, color: 'white', padding: '48px 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>Contacta con nosotros</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap', fontSize: '0.9rem', marginBottom: 16 }}>
            {phone && <span>📞 {phone}</span>}
            {email && <span>✉️ {email}</span>}
            {address && <span>📍 {address}</span>}
            {scheduleText && <span>🕐 {scheduleText}</span>}
          </div>
          <SocialLinks settings={settings} color="rgba(255,255,255,0.8)" />
          <p style={{ opacity: 0.5, fontSize: '0.78rem', margin: '20px 0 0' }}>© {new Date().getFullYear()} {companyName}. Creado con HabitaClick.</p>
        </footer>
      )}

      {showWhatsappFloat && <FloatingWhatsApp whatsapp={whatsapp} />}
    </div>
  );
}

function TemplateMinimalista({ settings, properties }) {
  const { primaryColor = '#003366', accentColor = '#2ECC71', companyName, tagline, description, aboutText,
    phone, whatsapp, email, address, scheduleText, logoUrl, heroCtaText, fontFamily, buttonRadius,
    showPrices, showHero, showAbout, showContact, showWhatsappFloat } = settings;
  const font = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.sans;
  const radius = BTN_RADIUS[buttonRadius] || '8px';

  return (
    <div style={{ fontFamily: font, background: 'white', minHeight: '100vh' }}>
      <header style={{ borderBottom: `2px solid ${accentColor}`, padding: '20px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {logoUrl
          ? <img src={logoUrl} alt={companyName} style={{ height: 40, objectFit: 'contain' }} />
          : <h1 style={{ color: primaryColor, margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: -0.5 }}>{companyName || 'Mi Agencia'}</h1>
        }
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {phone && <a href={`tel:${phone}`} style={{ color: '#555', textDecoration: 'none', fontSize: '0.9rem' }}>{phone}</a>}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} style={{ background: primaryColor, color: 'white', padding: '8px 18px', borderRadius: radius, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }} target="_blank" rel="noreferrer">
              Contactar
            </a>
          )}
        </div>
      </header>

      {showHero && (
        <div style={{ padding: '80px 60px', maxWidth: 760 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#111', lineHeight: 1.1, marginBottom: 16 }}>{tagline || 'Tu hogar ideal te espera'}</h2>
          {description && <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 32 }}>{description}</p>}
          <a href="#propiedades" style={{ background: accentColor, color: 'white', padding: '12px 28px', borderRadius: radius, textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
            {heroCtaText || 'Ver propiedades'}
          </a>
        </div>
      )}

      <StatsBar settings={settings} bg="#f9fafb" textColor={primaryColor} />

      {showAbout && aboutText && (
        <div style={{ maxWidth: 760, padding: '56px 60px' }}>
          <h2 style={{ color: '#111', fontSize: '1.8rem', fontWeight: 800, marginBottom: 16 }}>Sobre nosotros</h2>
          <div style={{ width: 48, height: 3, background: accentColor, marginBottom: 20 }} />
          <p style={{ color: '#444', fontSize: '1.05rem', lineHeight: 1.8 }}>{aboutText}</p>
        </div>
      )}

      <ServicesSection settings={settings} bg="#f9fafb" titleColor="#111" cardBg="white" cardShadow="0 1px 8px rgba(0,0,0,0.07)" />

      {settings.showProperties && (
        <div id="propiedades" style={{ background: '#f9fafb', padding: '64px 40px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ color: '#111', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Propiedades</h2>
            <div style={{ width: 40, height: 3, background: accentColor, marginBottom: 36 }} />
            {properties.length === 0
              ? <p style={{ color: '#9ca3af' }}>Próximamente publicaremos propiedades disponibles.</p>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {properties.map(p => <PropertyCard key={p.id} prop={p} showPrices={showPrices} accentColor={accentColor} primaryColor={primaryColor} btnRadius={radius} />)}
                </div>
            }
          </div>
        </div>
      )}

      <TestimonialsSection settings={settings} bg="white" titleColor="#111" />
      <MapSection settings={settings} />

      {showContact && (
        <footer style={{ padding: '56px 60px', borderTop: '1px solid #e5e7eb' }}>
          <h2 style={{ color: '#111', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Contacto</h2>
          <div style={{ width: 36, height: 3, background: accentColor, marginBottom: 24 }} />
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', color: '#555', fontSize: '0.95rem', marginBottom: 12 }}>
            {phone && <span>📞 {phone}</span>}
            {email && <span>✉️ {email}</span>}
            {address && <span>📍 {address}</span>}
            {scheduleText && <span>🕐 {scheduleText}</span>}
          </div>
          <SocialLinks settings={settings} color="#555" />
          <p style={{ color: '#d1d5db', fontSize: '0.75rem', marginTop: 24 }}>© {new Date().getFullYear()} {companyName} · Powered by HabitaClick</p>
        </footer>
      )}

      {showWhatsappFloat && <FloatingWhatsApp whatsapp={whatsapp} />}
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

  useEffect(() => {
    if (!data?.settings) return;
    const s = data.settings;

    if (s.metaTitle) document.title = s.metaTitle;
    else if (s.companyName) document.title = s.companyName;

    if (s.metaDescription) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
      meta.content = s.metaDescription;
    }

    if (s.fontFamily === 'montserrat') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    } else if (s.fontFamily === 'nunito') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    if (s.googleAnalyticsId) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${s.googleAnalyticsId}`;
      script.async = true;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', s.googleAnalyticsId);
    }
  }, [data]);

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

  const s = data.settings || {};

  const filtered = (data.properties || [])
    .filter(p => {
      if (s.propertyFilter === 'sale') return p.transaction_type === 'sale';
      if (s.propertyFilter === 'rent') return p.transaction_type === 'rent';
      return true;
    })
    .sort((a, b) => {
      if (s.propertySortOrder === 'price_asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (s.propertySortOrder === 'price_desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
      return (b.id || 0) - (a.id || 0);
    })
    .slice(0, s.maxProperties || 12);

  const Template = TEMPLATES[s.template] || TemplateModerno;
  return <Template settings={s} properties={filtered} />;
}
