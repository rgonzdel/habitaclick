import React, { useState, useEffect } from 'react';
import './WebsiteBuilder.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const TEMPLATES = [
  { id: 'moderno', name: 'Moderno', description: 'Diseño oscuro y elegante con degradado' },
  { id: 'clasico', name: 'Clásico', description: 'Estilo tradicional inmobiliario, serio y profesional' },
  { id: 'minimalista', name: 'Minimalista', description: 'Diseño blanco limpio, foco en el contenido' },
];

const STEPS = ['Plantilla', 'Diseño', 'Contenido', 'SEO', 'Publicar'];

const SECTION_TOGGLES = [
  { key: 'showHero', label: 'Hero / Banner', icon: '🎯' },
  { key: 'showAbout', label: 'Sobre nosotros', icon: '👥' },
  { key: 'showStats', label: 'Estadísticas', icon: '📊' },
  { key: 'showServices', label: 'Servicios', icon: '🛠️' },
  { key: 'showProperties', label: 'Propiedades', icon: '🏠' },
  { key: 'showTestimonials', label: 'Testimonios', icon: '💬' },
  { key: 'showMap', label: 'Mapa', icon: '📍' },
  { key: 'showContact', label: 'Contacto', icon: '📞' },
];

const DEFAULT_SETTINGS = {
  template: 'moderno',
  primaryColor: '#003366',
  accentColor: '#2ECC71',
  fontFamily: 'sans',
  buttonRadius: 'medium',
  logoUrl: '',

  companyName: '',
  tagline: 'Tu hogar ideal te espera',
  heroCtaText: 'Contactar por WhatsApp',
  description: '',
  aboutText: '',

  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  scheduleText: '',
  mapUrl: '',

  instagram: '',
  facebook: '',
  linkedin: '',
  tiktok: '',
  youtube: '',

  showPrices: true,
  showHero: true,
  showAbout: false,
  showStats: false,
  showServices: false,
  showProperties: true,
  showTestimonials: false,
  showMap: false,
  showContact: true,
  showWhatsappFloat: true,

  yearsExperience: '',
  propertiesSold: '',
  clientsServed: '',

  services: [],
  testimonials: [],

  propertyFilter: 'all',
  maxProperties: 12,
  propertySortOrder: 'newest',

  metaTitle: '',
  metaDescription: '',
  googleAnalyticsId: '',

  slug: '',
  published: false,
};

function TemplateMockup({ type, primaryColor, accentColor }) {
  const pc = primaryColor || '#003366';
  const ac = accentColor || '#2ECC71';

  if (type === 'moderno') return (
    <div className="wb-mockup wb-mockup-moderno" style={{ background: pc }}>
      <div className="wbm-bar" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <div className="wbm-dot" /><div className="wbm-logo" />
        <div className="wbm-btn" style={{ background: ac }} />
      </div>
      <div className="wbm-hero" style={{ background: `linear-gradient(135deg, ${pc}, #0d1b2a)` }}>
        <div className="wbm-h1" /><div className="wbm-h2" />
        <div className="wbm-cta" style={{ background: ac }} />
      </div>
      <div className="wbm-cards">
        {[0,1,2].map(i => <div key={i} className="wbm-card" style={{ borderTop: `3px solid ${ac}` }} />)}
      </div>
    </div>
  );

  if (type === 'clasico') return (
    <div className="wb-mockup wb-mockup-clasico" style={{ background: '#fff' }}>
      <div className="wbm-bar" style={{ background: pc }}>
        <div className="wbm-logo" style={{ background: 'rgba(255,255,255,0.4)' }} />
        <div className="wbm-btn" style={{ background: ac }} />
      </div>
      <div className="wbm-hero-clasico" style={{ background: '#f8f5f0', borderBottom: `4px solid ${ac}` }}>
        <div className="wbm-h1" style={{ background: pc }} /><div className="wbm-h2" />
      </div>
      <div className="wbm-cards" style={{ background: '#f8f5f0' }}>
        {[0,1,2].map(i => <div key={i} className="wbm-card" style={{ border: `2px solid ${ac}` }} />)}
      </div>
    </div>
  );

  return (
    <div className="wb-mockup wb-mockup-minimal" style={{ background: '#fff' }}>
      <div className="wbm-bar" style={{ background: '#fff', borderBottom: `2px solid ${ac}` }}>
        <div className="wbm-logo" style={{ background: '#eee' }} />
        <div className="wbm-btn" style={{ background: pc }} />
      </div>
      <div className="wbm-hero-minimal">
        <div className="wbm-h1" style={{ background: '#222' }} />
        <div className="wbm-h2" style={{ background: '#ccc' }} />
        <div className="wbm-cta" style={{ background: ac, width: '40%' }} />
      </div>
      <div className="wbm-cards">
        {[0,1,2].map(i => <div key={i} className="wbm-card" style={{ border: `1px solid #e5e7eb` }} />)}
      </div>
    </div>
  );
}

export default function WebsiteBuilder({ onToast }) {
  const [step, setStep] = useState(0);
  const [contentTab, setContentTab] = useState('general');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/api/v1/website/settings`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(d => { if (d.settings) setSettings({ ...DEFAULT_SETTINGS, ...d.settings }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const save = async (publish = null) => {
    setSaving(true);
    const toSave = publish !== null ? { ...settings, published: publish } : settings;
    if (publish !== null) setSettings(toSave);
    try {
      const res = await fetch(`${API}/api/v1/website/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(toSave)
      });
      if (res.ok) {
        onToast('success', publish ? 'Página web publicada' : 'Cambios guardados');
      } else {
        const d = await res.json();
        onToast('error', d.error || 'Error al guardar');
      }
    } catch {
      onToast('error', 'Error de conexión');
    }
    setSaving(false);
  };

  // Services helpers
  const addService = () => set('services', [...(settings.services || []), { icon: '🏠', title: '', description: '' }]);
  const removeService = i => set('services', settings.services.filter((_, idx) => idx !== i));
  const updateService = (i, key, val) => {
    const updated = [...settings.services];
    updated[i] = { ...updated[i], [key]: val };
    set('services', updated);
  };

  // Testimonials helpers
  const addTestimonial = () => set('testimonials', [...(settings.testimonials || []), { name: '', text: '', rating: 5 }]);
  const removeTestimonial = i => set('testimonials', settings.testimonials.filter((_, idx) => idx !== i));
  const updateTestimonial = (i, key, val) => {
    const updated = [...settings.testimonials];
    updated[i] = { ...updated[i], [key]: val };
    set('testimonials', updated);
  };

  if (loading) return <div className="wb-loading">Cargando configuración...</div>;

  return (
    <div className="wb-wrap">
      {/* Header */}
      <div className="wb-header">
        <div>
          <h2 className="wb-title">🌐 Constructor de Página Web</h2>
          <p className="wb-subtitle">Crea tu propia web inmobiliaria en minutos</p>
        </div>
        <div className="wb-header-actions">
          <button className="wb-btn-preview" onClick={() => setShowPreview(true)}>👁 Vista previa</button>
          <button className="wb-btn-save" onClick={() => save()} disabled={saving}>
            {saving ? 'Guardando…' : '💾 Guardar'}
          </button>
        </div>
      </div>

      {/* Steps nav */}
      <div className="wb-steps">
        {STEPS.map((s, i) => (
          <button
            key={i}
            className={`wb-step${step === i ? ' active' : ''}${i < step ? ' done' : ''}`}
            onClick={() => setStep(i)}
          >
            <span className="wb-step-num">{i < step ? '✓' : i + 1}</span>
            <span className="wb-step-label">{s}</span>
          </button>
        ))}
      </div>

      {/* ── STEP 0: Plantilla ── */}
      {step === 0 && (
        <div className="wb-panel">
          <h3 className="wb-panel-title">Elige tu plantilla</h3>
          <p className="wb-panel-desc">Puedes cambiarla en cualquier momento sin perder tu contenido</p>
          <div className="wb-templates">
            {TEMPLATES.map(t => (
              <div
                key={t.id}
                className={`wb-template-card${settings.template === t.id ? ' selected' : ''}`}
                onClick={() => set('template', t.id)}
              >
                <TemplateMockup type={t.id} primaryColor={settings.primaryColor} accentColor={settings.accentColor} />
                <div className="wb-template-info">
                  <strong>{t.name}</strong>
                  <span>{t.description}</span>
                </div>
                {settings.template === t.id && <div className="wb-template-check">✓</div>}
              </div>
            ))}
          </div>

          <div className="wb-section-divider">Logo de la agencia</div>
          <div className="wb-field" style={{ maxWidth: 500 }}>
            <label>URL del logo <span style={{ color: '#9ca3af', fontWeight: 400 }}>(enlace a imagen PNG/SVG)</span></label>
            <input
              value={settings.logoUrl}
              onChange={e => set('logoUrl', e.target.value)}
              placeholder="https://tudominio.com/logo.png"
            />
            {settings.logoUrl && (
              <div style={{ marginTop: 10, padding: 12, background: '#f3f4f6', borderRadius: 8, display: 'inline-block' }}>
                <img src={settings.logoUrl} alt="Logo" style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
              </div>
            )}
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '6px 0 0' }}>
              Si no tienes URL, tu logo está disponible en: <strong>/logos/logo.png</strong>
            </p>
          </div>

          <div className="wb-panel-footer">
            <button className="wb-btn-next" onClick={() => setStep(1)}>Siguiente: Diseño →</button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Diseño ── */}
      {step === 1 && (
        <div className="wb-panel">
          <h3 className="wb-panel-title">Personaliza el diseño</h3>
          <div className="wb-design-grid">
            <div className="wb-design-left">

              <div className="wb-section-divider">Colores</div>
              <div className="wb-field">
                <label>Color principal</label>
                <div className="wb-color-row">
                  <input type="color" value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)} />
                  <input type="text" value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)} maxLength={7} />
                </div>
                <div className="wb-color-presets">
                  {['#003366','#1a1a2e','#2c3e50','#8B0000','#1a472a','#4a0080','#1a237e','#bf360c'].map(c => (
                    <button key={c} style={{ background: c }} onClick={() => set('primaryColor', c)} className={settings.primaryColor === c ? 'active' : ''} title={c} />
                  ))}
                </div>
              </div>

              <div className="wb-field">
                <label>Color de acento</label>
                <div className="wb-color-row">
                  <input type="color" value={settings.accentColor} onChange={e => set('accentColor', e.target.value)} />
                  <input type="text" value={settings.accentColor} onChange={e => set('accentColor', e.target.value)} maxLength={7} />
                </div>
                <div className="wb-color-presets">
                  {['#2ECC71','#e67e22','#e74c3c','#3498db','#f1c40f','#9b59b6','#1abc9c','#e91e63'].map(c => (
                    <button key={c} style={{ background: c }} onClick={() => set('accentColor', c)} className={settings.accentColor === c ? 'active' : ''} title={c} />
                  ))}
                </div>
              </div>

              <div className="wb-section-divider">Tipografía</div>
              <div className="wb-field">
                <label>Tipo de letra</label>
                <div className="wb-font-options">
                  {[
                    { id: 'sans', label: 'Sans-serif', sample: 'Aa', style: '-apple-system, sans-serif' },
                    { id: 'serif', label: 'Serif', sample: 'Aa', style: 'Georgia, serif' },
                    { id: 'montserrat', label: 'Montserrat', sample: 'Aa', style: '"Montserrat", sans-serif' },
                    { id: 'nunito', label: 'Nunito', sample: 'Aa', style: '"Nunito", sans-serif' },
                  ].map(f => (
                    <button
                      key={f.id}
                      className={`wb-font-card${settings.fontFamily === f.id ? ' active' : ''}`}
                      onClick={() => set('fontFamily', f.id)}
                    >
                      <span className="wb-font-sample" style={{ fontFamily: f.style }}>{f.sample}</span>
                      <span className="wb-font-name">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="wb-section-divider">Botones</div>
              <div className="wb-field">
                <label>Forma de los botones</label>
                <div className="wb-radius-options">
                  {[
                    { id: 'square', label: 'Cuadrado', radius: '4px' },
                    { id: 'medium', label: 'Normal', radius: '8px' },
                    { id: 'round', label: 'Redondeado', radius: '30px' },
                  ].map(r => (
                    <button
                      key={r.id}
                      className={`wb-radius-card${settings.buttonRadius === r.id ? ' active' : ''}`}
                      onClick={() => set('buttonRadius', r.id)}
                    >
                      <div className="wb-radius-preview" style={{ borderRadius: r.radius, background: settings.accentColor }} />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="wb-section-divider">Opciones generales</div>
              <div className="wb-toggles-row">
                <div className="wb-toggle-item">
                  <span>Mostrar precios</span>
                  <button className={`wb-toggle${settings.showPrices ? ' on' : ''}`} onClick={() => set('showPrices', !settings.showPrices)}>
                    {settings.showPrices ? 'Sí' : 'No'}
                  </button>
                </div>
                <div className="wb-toggle-item">
                  <span>Botón WhatsApp flotante</span>
                  <button className={`wb-toggle${settings.showWhatsappFloat ? ' on' : ''}`} onClick={() => set('showWhatsappFloat', !settings.showWhatsappFloat)}>
                    {settings.showWhatsappFloat ? 'Sí' : 'No'}
                  </button>
                </div>
              </div>

              <div className="wb-section-divider">Secciones visibles</div>
              <div className="wb-sections-grid">
                {SECTION_TOGGLES.map(s => (
                  <button
                    key={s.key}
                    className={`wb-section-toggle${settings[s.key] ? ' on' : ''}`}
                    onClick={() => set(s.key, !settings[s.key])}
                  >
                    <span className="wb-section-toggle-icon">{s.icon}</span>
                    <span className="wb-section-toggle-label">{s.label}</span>
                    <span className="wb-section-toggle-state">{settings[s.key] ? '✓' : '–'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="wb-design-right">
              <p className="wb-preview-label">Vista previa</p>
              <TemplateMockup type={settings.template} primaryColor={settings.primaryColor} accentColor={settings.accentColor} />
            </div>
          </div>
          <div className="wb-panel-footer">
            <button className="wb-btn-back" onClick={() => setStep(0)}>← Atrás</button>
            <button className="wb-btn-next" onClick={() => setStep(2)}>Siguiente: Contenido →</button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Contenido ── */}
      {step === 2 && (
        <div className="wb-panel">
          <h3 className="wb-panel-title">Contenido de tu web</h3>

          {/* Sub-tabs */}
          <div className="wb-content-tabs">
            {[
              { id: 'general', label: '📋 General' },
              { id: 'estadisticas', label: '📊 Estadísticas' },
              { id: 'propiedades', label: '🏠 Propiedades' },
              { id: 'servicios', label: '🛠️ Servicios' },
              { id: 'testimonios', label: '💬 Testimonios' },
            ].map(t => (
              <button
                key={t.id}
                className={`wb-content-tab${contentTab === t.id ? ' active' : ''}`}
                onClick={() => setContentTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: General */}
          {contentTab === 'general' && (
            <div className="wb-form-grid">
              <div className="wb-section-divider wb-field-full">Información básica</div>
              <div className="wb-field">
                <label>Nombre de la agencia *</label>
                <input value={settings.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Ej: Inmobiliaria García" />
              </div>
              <div className="wb-field">
                <label>Eslogan</label>
                <input value={settings.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Tu hogar ideal te espera" />
              </div>
              <div className="wb-field wb-field-full">
                <label>Descripción de la agencia</label>
                <textarea value={settings.description} onChange={e => set('description', e.target.value)} placeholder="Describe tu agencia, especialidad, años de experiencia..." rows={3} />
              </div>
              <div className="wb-field wb-field-full">
                <label>Texto "Sobre nosotros" <span style={{ color: '#9ca3af', fontWeight: 400 }}>(sección extendida)</span></label>
                <textarea value={settings.aboutText} onChange={e => set('aboutText', e.target.value)} placeholder="Cuéntanos la historia de tu agencia, tu equipo, tus valores..." rows={4} />
              </div>
              <div className="wb-field">
                <label>Texto del botón principal del hero</label>
                <input value={settings.heroCtaText} onChange={e => set('heroCtaText', e.target.value)} placeholder="Contactar por WhatsApp" />
              </div>

              <div className="wb-section-divider wb-field-full">Datos de contacto</div>
              <div className="wb-field">
                <label>Teléfono</label>
                <input value={settings.phone} onChange={e => set('phone', e.target.value)} placeholder="+34 600 000 000" />
              </div>
              <div className="wb-field">
                <label>WhatsApp</label>
                <input value={settings.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+34 600 000 000" />
              </div>
              <div className="wb-field">
                <label>Email de contacto</label>
                <input type="email" value={settings.email} onChange={e => set('email', e.target.value)} placeholder="info@tuagencia.com" />
              </div>
              <div className="wb-field">
                <label>Dirección</label>
                <input value={settings.address} onChange={e => set('address', e.target.value)} placeholder="Calle Principal 1, Madrid" />
              </div>
              <div className="wb-field wb-field-full">
                <label>Horario de atención</label>
                <input value={settings.scheduleText} onChange={e => set('scheduleText', e.target.value)} placeholder="Lun–Vie 9:00–20:00 · Sáb 10:00–14:00" />
              </div>
              <div className="wb-field wb-field-full">
                <label>URL de mapa Google Maps <span style={{ color: '#9ca3af', fontWeight: 400 }}>(embed)</span></label>
                <input value={settings.mapUrl} onChange={e => set('mapUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
                <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '4px 0 0' }}>
                  En Google Maps → Compartir → Incorporar un mapa → copia el src del iframe
                </p>
              </div>

              <div className="wb-section-divider wb-field-full">Redes sociales</div>
              <div className="wb-field">
                <label>Instagram</label>
                <input value={settings.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@tuagencia" />
              </div>
              <div className="wb-field">
                <label>Facebook</label>
                <input value={settings.facebook} onChange={e => set('facebook', e.target.value)} placeholder="tuagencia o URL completa" />
              </div>
              <div className="wb-field">
                <label>LinkedIn</label>
                <input value={settings.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="company/tuagencia o URL" />
              </div>
              <div className="wb-field">
                <label>TikTok</label>
                <input value={settings.tiktok} onChange={e => set('tiktok', e.target.value)} placeholder="@tuagencia" />
              </div>
              <div className="wb-field">
                <label>YouTube</label>
                <input value={settings.youtube} onChange={e => set('youtube', e.target.value)} placeholder="URL del canal" />
              </div>
            </div>
          )}

          {/* Tab: Estadísticas */}
          {contentTab === 'estadisticas' && (
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 20px' }}>
                Activa la sección "Estadísticas" en el paso Diseño para mostrarlas. Los campos vacíos no se muestran.
              </p>
              <div className="wb-form-grid">
                <div className="wb-field">
                  <label>Años de experiencia</label>
                  <input type="number" value={settings.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} placeholder="Ej: 15" min="0" />
                </div>
                <div className="wb-field">
                  <label>Propiedades vendidas</label>
                  <input type="number" value={settings.propertiesSold} onChange={e => set('propertiesSold', e.target.value)} placeholder="Ej: 500" min="0" />
                </div>
                <div className="wb-field">
                  <label>Clientes satisfechos</label>
                  <input type="number" value={settings.clientsServed} onChange={e => set('clientsServed', e.target.value)} placeholder="Ej: 300" min="0" />
                </div>
              </div>
              <div className="wb-stats-preview">
                {[
                  [settings.yearsExperience, 'Años de experiencia'],
                  [settings.propertiesSold, 'Propiedades vendidas'],
                  [settings.clientsServed, 'Clientes satisfechos'],
                ].filter(([v]) => v).map(([value, label], i) => (
                  <div key={i} className="wb-stat-card">
                    <div className="wb-stat-value" style={{ color: settings.accentColor }}>{value}+</div>
                    <div className="wb-stat-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Propiedades */}
          {contentTab === 'propiedades' && (
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 20px' }}>
                Configura cómo se muestran tus propiedades en la web pública.
              </p>
              <div className="wb-form-grid">
                <div className="wb-field">
                  <label>Filtro de propiedades</label>
                  <select value={settings.propertyFilter} onChange={e => set('propertyFilter', e.target.value)}>
                    <option value="all">Todas (venta y alquiler)</option>
                    <option value="sale">Solo en venta</option>
                    <option value="rent">Solo en alquiler</option>
                  </select>
                </div>
                <div className="wb-field">
                  <label>Máximo de propiedades a mostrar</label>
                  <select value={settings.maxProperties} onChange={e => set('maxProperties', Number(e.target.value))}>
                    <option value={6}>6 propiedades</option>
                    <option value={9}>9 propiedades</option>
                    <option value={12}>12 propiedades</option>
                    <option value={16}>16 propiedades</option>
                    <option value={24}>24 propiedades</option>
                    <option value={999}>Todas</option>
                  </select>
                </div>
                <div className="wb-field">
                  <label>Orden de las propiedades</label>
                  <select value={settings.propertySortOrder} onChange={e => set('propertySortOrder', e.target.value)}>
                    <option value="newest">Más recientes primero</option>
                    <option value="price_asc">Precio: menor a mayor</option>
                    <option value="price_desc">Precio: mayor a menor</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Servicios */}
          {contentTab === 'servicios' && (
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 16px' }}>
                Activa la sección "Servicios" en el paso Diseño. Puedes añadir hasta 6 servicios.
              </p>
              {(settings.services || []).map((svc, i) => (
                <div key={i} className="wb-item-row">
                  <input
                    className="wb-icon-input"
                    value={svc.icon}
                    onChange={e => updateService(i, 'icon', e.target.value)}
                    placeholder="🏠"
                    maxLength={2}
                    title="Emoji del servicio"
                  />
                  <div className="wb-item-fields">
                    <input
                      value={svc.title}
                      onChange={e => updateService(i, 'title', e.target.value)}
                      placeholder="Nombre del servicio (ej: Compraventa)"
                    />
                    <input
                      value={svc.description}
                      onChange={e => updateService(i, 'description', e.target.value)}
                      placeholder="Breve descripción del servicio"
                    />
                  </div>
                  <button className="wb-item-remove" onClick={() => removeService(i)} title="Eliminar">✕</button>
                </div>
              ))}
              {(settings.services || []).length < 6 && (
                <button className="wb-add-btn" onClick={addService}>+ Añadir servicio</button>
              )}
            </div>
          )}

          {/* Tab: Testimonios */}
          {contentTab === 'testimonios' && (
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 16px' }}>
                Activa la sección "Testimonios" en el paso Diseño. Puedes añadir hasta 6 testimonios.
              </p>
              {(settings.testimonials || []).map((t, i) => (
                <div key={i} className="wb-testimonial-row">
                  <div className="wb-testimonial-fields">
                    <div style={{ display: 'flex', gap: 12 }}>
                      <input
                        value={t.name}
                        onChange={e => updateTestimonial(i, 'name', e.target.value)}
                        placeholder="Nombre del cliente"
                        style={{ flex: 1 }}
                      />
                      <div className="wb-stars-select">
                        {[5,4,3,2,1].map(star => (
                          <button
                            key={star}
                            className={`wb-star${(t.rating || 5) >= star ? ' active' : ''}`}
                            onClick={() => updateTestimonial(i, 'rating', star)}
                          >★</button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={t.text}
                      onChange={e => updateTestimonial(i, 'text', e.target.value)}
                      placeholder="Testimonio del cliente..."
                      rows={2}
                    />
                  </div>
                  <button className="wb-item-remove" onClick={() => removeTestimonial(i)} title="Eliminar">✕</button>
                </div>
              ))}
              {(settings.testimonials || []).length < 6 && (
                <button className="wb-add-btn" onClick={addTestimonial}>+ Añadir testimonio</button>
              )}
            </div>
          )}

          <div className="wb-panel-footer">
            <button className="wb-btn-back" onClick={() => setStep(1)}>← Atrás</button>
            <button className="wb-btn-next" onClick={() => setStep(3)}>Siguiente: SEO →</button>
          </div>
        </div>
      )}

      {/* ── STEP 3: SEO ── */}
      {step === 3 && (
        <div className="wb-panel">
          <h3 className="wb-panel-title">SEO y analíticas</h3>
          <p className="wb-panel-desc">Mejora el posicionamiento en buscadores y mide el tráfico de tu página</p>

          <div className="wb-section-divider">SEO básico</div>
          <div className="wb-form-grid">
            <div className="wb-field wb-field-full">
              <label>Título SEO de la página</label>
              <input
                value={settings.metaTitle}
                onChange={e => set('metaTitle', e.target.value)}
                placeholder={`${settings.companyName || 'Tu Agencia'} — Inmobiliaria en Madrid`}
                maxLength={70}
              />
              <p style={{ fontSize: '0.78rem', color: settings.metaTitle.length > 60 ? '#e74c3c' : '#9ca3af', margin: '4px 0 0' }}>
                {settings.metaTitle.length}/70 caracteres — recomendado: menos de 60
              </p>
            </div>
            <div className="wb-field wb-field-full">
              <label>Descripción SEO</label>
              <textarea
                value={settings.metaDescription}
                onChange={e => set('metaDescription', e.target.value)}
                placeholder={`Somos ${settings.companyName || 'tu agencia inmobiliaria'} especializada en compraventa y alquiler de pisos en Madrid. Más de ${settings.yearsExperience || 'X'} años de experiencia.`}
                rows={3}
                maxLength={160}
              />
              <p style={{ fontSize: '0.78rem', color: settings.metaDescription.length > 150 ? '#e74c3c' : '#9ca3af', margin: '4px 0 0' }}>
                {settings.metaDescription.length}/160 caracteres — recomendado: 120–155
              </p>
            </div>
          </div>

          <div className="wb-section-divider">Analíticas</div>
          <div className="wb-form-grid">
            <div className="wb-field">
              <label>ID de Google Analytics</label>
              <input
                value={settings.googleAnalyticsId}
                onChange={e => set('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '4px 0 0' }}>
                Crea una propiedad en <strong>analytics.google.com</strong> y copia el ID de medición
              </p>
            </div>
          </div>

          <div className="wb-seo-tips">
            <h4>💡 Consejos SEO</h4>
            <ul>
              <li>Incluye tu ciudad principal en el título SEO: "Inmobiliaria en <strong>Madrid</strong>"</li>
              <li>La descripción debe responder a qué haces y dónde — es lo que ve Google</li>
              <li>El nombre de la agencia y el eslogan también influyen en el posicionamiento</li>
            </ul>
          </div>

          <div className="wb-panel-footer">
            <button className="wb-btn-back" onClick={() => setStep(2)}>← Atrás</button>
            <button className="wb-btn-next" onClick={() => setStep(4)}>Siguiente: Publicar →</button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Publicar ── */}
      {step === 4 && (
        <div className="wb-panel">
          <h3 className="wb-panel-title">Publica tu página web</h3>

          <div className="wb-field" style={{ maxWidth: 500 }}>
            <label>URL de tu página <span style={{ color: '#9ca3af', fontWeight: 400 }}>(solo letras, números y guiones)</span></label>
            <div className="wb-slug-row">
              <span className="wb-slug-prefix">habitaclick.es/sitio/</span>
              <input
                value={settings.slug}
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="mi-agencia"
                maxLength={40}
              />
            </div>
            {settings.slug && (
              <p className="wb-slug-preview">
                Tu web: <strong>habitaclick.es/sitio/{settings.slug}</strong>
              </p>
            )}
          </div>

          <div className="wb-publish-cards">
            <div className="wb-publish-card">
              <div className="wb-publish-icon">🌐</div>
              <h4>Subdominio gratuito</h4>
              <p>Activa tu página en <strong>habitaclick.es/sitio/{settings.slug || 'tu-agencia'}</strong> — sin coste adicional.</p>
              <button
                className={`wb-btn-publish${settings.published ? ' published' : ''}`}
                onClick={() => save(true)}
                disabled={saving || !settings.slug || !settings.companyName}
              >
                {settings.published ? '✓ Publicada — Republicar' : '🚀 Publicar página'}
              </button>
              {(!settings.slug || !settings.companyName) && (
                <p className="wb-publish-warn">⚠️ Completa el nombre de agencia y la URL para publicar</p>
              )}
              {settings.published && settings.slug && (
                <a className="wb-visit-link" href={`/sitio/${settings.slug}`} target="_blank" rel="noreferrer">
                  Ver mi página →
                </a>
              )}
            </div>

            <div className="wb-publish-card wb-publish-card-domain">
              <div className="wb-publish-icon">🔗</div>
              <h4>Dominio propio</h4>
              <p>Conecta tu propio dominio (ej: <strong>miagencia.es</strong>) apuntando un registro CNAME:</p>
              <div className="wb-domain-instructions">
                <div className="wb-dns-row"><span>Tipo</span><strong>CNAME</strong></div>
                <div className="wb-dns-row"><span>Nombre</span><strong>www</strong></div>
                <div className="wb-dns-row"><span>Valor</span><strong>cname.vercel-dns.com</strong></div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.75rem' }}>
                Tras configurar el DNS, escríbenos a hola@habitaclick.es con tu dominio y lo activamos.
              </p>
            </div>
          </div>

          <div className="wb-panel-footer">
            <button className="wb-btn-back" onClick={() => setStep(3)}>← Atrás</button>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {showPreview && (
        <div className="wb-preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="wb-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="wb-preview-header">
              <span>Vista previa — {TEMPLATES.find(t => t.id === settings.template)?.name}</span>
              <button onClick={() => setShowPreview(false)}>✕</button>
            </div>
            <div className="wb-preview-body">
              <iframe
                src={`/sitio/${settings.slug || '__preview__'}?preview=1`}
                title="Vista previa"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
