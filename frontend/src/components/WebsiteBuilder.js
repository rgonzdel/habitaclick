import React, { useState, useEffect, useRef } from 'react';
import './WebsiteBuilder.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const TEMPLATES = [
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Diseño oscuro y elegante con hero de vídeo',
    preview: 'moderno'
  },
  {
    id: 'clasico',
    name: 'Clásico',
    description: 'Estilo tradicional inmobiliario, limpio y profesional',
    preview: 'clasico'
  },
  {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Diseño blanco y limpio, foco en las propiedades',
    preview: 'minimalista'
  }
];

const DEFAULT_SETTINGS = {
  template: 'moderno',
  primaryColor: '#003366',
  accentColor: '#2ECC71',
  companyName: '',
  tagline: 'Tu hogar ideal te espera',
  description: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  slug: '',
  showPrices: true,
  published: false,
  instagram: '',
  facebook: ''
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

export default function WebsiteBuilder({ currentUserRole, onToast, properties }) {
  const [step, setStep] = useState(0); // 0=plantilla, 1=diseño, 2=contenido, 3=dominio
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const token = localStorage.getItem('token');

  const STEPS = ['Plantilla', 'Diseño', 'Contenido', 'Publicar'];

  useEffect(() => {
    fetch(`${API}/api/v1/website/settings`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(d => {
        if (d.settings) setSettings({ ...DEFAULT_SETTINGS, ...d.settings });
      })
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
          <button className="wb-btn-preview" onClick={() => setShowPreview(true)}>
            👁 Vista previa
          </button>
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

      {/* Step 0: Plantilla */}
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
          <div className="wb-panel-footer">
            <button className="wb-btn-next" onClick={() => setStep(1)}>Siguiente: Diseño →</button>
          </div>
        </div>
      )}

      {/* Step 1: Diseño */}
      {step === 1 && (
        <div className="wb-panel">
          <h3 className="wb-panel-title">Personaliza el diseño</h3>
          <div className="wb-design-grid">
            <div className="wb-design-left">
              <div className="wb-field">
                <label>Color principal</label>
                <div className="wb-color-row">
                  <input type="color" value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)} />
                  <input type="text" value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)} maxLength={7} />
                </div>
                <div className="wb-color-presets">
                  {['#003366','#1a1a2e','#2c3e50','#8B0000','#1a472a','#4a0080'].map(c => (
                    <button key={c} style={{ background: c }} onClick={() => set('primaryColor', c)} className={settings.primaryColor === c ? 'active' : ''} />
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
                  {['#2ECC71','#e67e22','#e74c3c','#3498db','#f1c40f','#9b59b6'].map(c => (
                    <button key={c} style={{ background: c }} onClick={() => set('accentColor', c)} className={settings.accentColor === c ? 'active' : ''} />
                  ))}
                </div>
              </div>

              <div className="wb-field">
                <label>¿Mostrar precios en las propiedades?</label>
                <div className="wb-toggle-row">
                  <button className={`wb-toggle${settings.showPrices ? ' on' : ''}`} onClick={() => set('showPrices', !settings.showPrices)}>
                    {settings.showPrices ? '✓ Sí' : '✗ No'}
                  </button>
                  <span>{settings.showPrices ? 'Los precios son visibles' : 'Los precios están ocultos'}</span>
                </div>
              </div>
            </div>

            <div className="wb-design-right">
              <p className="wb-preview-label">Vista previa de plantilla</p>
              <TemplateMockup type={settings.template} primaryColor={settings.primaryColor} accentColor={settings.accentColor} />
            </div>
          </div>
          <div className="wb-panel-footer">
            <button className="wb-btn-back" onClick={() => setStep(0)}>← Atrás</button>
            <button className="wb-btn-next" onClick={() => setStep(2)}>Siguiente: Contenido →</button>
          </div>
        </div>
      )}

      {/* Step 2: Contenido */}
      {step === 2 && (
        <div className="wb-panel">
          <h3 className="wb-panel-title">Información de tu agencia</h3>
          <div className="wb-form-grid">
            <div className="wb-field">
              <label>Nombre de la agencia *</label>
              <input value={settings.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Ej: Inmobiliaria García" />
            </div>
            <div className="wb-field">
              <label>Eslogan</label>
              <input value={settings.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Ej: Tu hogar ideal te espera" />
            </div>
            <div className="wb-field wb-field-full">
              <label>Descripción de la agencia</label>
              <textarea value={settings.description} onChange={e => set('description', e.target.value)} placeholder="Describe tu agencia, especialidad, años de experiencia..." rows={3} />
            </div>
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
            <div className="wb-field">
              <label>Instagram</label>
              <input value={settings.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@tuagencia" />
            </div>
            <div className="wb-field">
              <label>Facebook</label>
              <input value={settings.facebook} onChange={e => set('facebook', e.target.value)} placeholder="facebook.com/tuagencia" />
            </div>
          </div>
          <div className="wb-panel-footer">
            <button className="wb-btn-back" onClick={() => setStep(1)}>← Atrás</button>
            <button className="wb-btn-next" onClick={() => setStep(3)}>Siguiente: Publicar →</button>
          </div>
        </div>
      )}

      {/* Step 3: Publicar */}
      {step === 3 && (
        <div className="wb-panel">
          <h3 className="wb-panel-title">Publica tu página web</h3>

          <div className="wb-field" style={{ maxWidth: 480 }}>
            <label>URL de tu página <span style={{ color: '#9ca3af' }}>(solo letras, números y guiones)</span></label>
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
            <button className="wb-btn-back" onClick={() => setStep(2)}>← Atrás</button>
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
                src={`/sitio/__preview__?template=${settings.template}&primary=${encodeURIComponent(settings.primaryColor)}&accent=${encodeURIComponent(settings.accentColor)}&company=${encodeURIComponent(settings.companyName || 'Mi Agencia')}&tagline=${encodeURIComponent(settings.tagline)}`}
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
