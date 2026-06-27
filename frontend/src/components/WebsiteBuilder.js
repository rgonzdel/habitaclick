import React, { useState, useEffect, useRef } from 'react';
import './WebsiteBuilder.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const FONTS = [
  { id: 'system', name: 'Sistema', css: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'inter', name: 'Inter', css: '"Inter", sans-serif', g: 'Inter:wght@400;500;600;700;800' },
  { id: 'roboto', name: 'Roboto', css: '"Roboto", sans-serif', g: 'Roboto:wght@400;500;700;900' },
  { id: 'opensans', name: 'Open Sans', css: '"Open Sans", sans-serif', g: 'Open+Sans:wght@400;600;700;800' },
  { id: 'montserrat', name: 'Montserrat', css: '"Montserrat", sans-serif', g: 'Montserrat:wght@400;600;700;800' },
  { id: 'poppins', name: 'Poppins', css: '"Poppins", sans-serif', g: 'Poppins:wght@400;500;600;700;800' },
  { id: 'lato', name: 'Lato', css: '"Lato", sans-serif', g: 'Lato:wght@400;700;900' },
  { id: 'raleway', name: 'Raleway', css: '"Raleway", sans-serif', g: 'Raleway:wght@400;600;700;800' },
  { id: 'nunito', name: 'Nunito', css: '"Nunito", sans-serif', g: 'Nunito:wght@400;600;700;800' },
  { id: 'playfair', name: 'Playfair Display', css: '"Playfair Display", Georgia, serif', g: 'Playfair+Display:wght@400;700;800' },
  { id: 'merriweather', name: 'Merriweather', css: '"Merriweather", serif', g: 'Merriweather:wght@400;700' },
  { id: 'georgia', name: 'Georgia (Serif)', css: 'Georgia, "Times New Roman", serif' },
];

const getFont = id => FONTS.find(f => f.id === id)?.css || FONTS[0].css;

function loadFont(fontId) {
  const f = FONTS.find(f => f.id === fontId);
  if (!f?.g) return;
  const lid = `gf-${fontId}`;
  if (document.getElementById(lid)) return;
  const link = document.createElement('link');
  link.id = lid; link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${f.g}&display=swap`;
  document.head.appendChild(link);
}

const BTN_RADII = { square: '3px', medium: '8px', round: '24px' };
const getBR = id => BTN_RADII[id] || '8px';

const SECTION_TYPES = [
  { type: 'hero', icon: '🎯', label: 'Hero / Banner' },
  { type: 'about', icon: '👥', label: 'Sobre nosotros' },
  { type: 'stats', icon: '📊', label: 'Estadísticas' },
  { type: 'services', icon: '🛠️', label: 'Servicios' },
  { type: 'properties', icon: '🏠', label: 'Propiedades' },
  { type: 'testimonials', icon: '💬', label: 'Testimonios' },
  { type: 'contact', icon: '📞', label: 'Contacto' },
  { type: 'map', icon: '📍', label: 'Mapa' },
  { type: 'text', icon: '📝', label: 'Texto libre' },
  { type: 'image', icon: '🖼️', label: 'Imagen' },
  { type: 'divider', icon: '➖', label: 'Separador' },
];

const DEFAULTS = {
  hero: { headline: 'Tu hogar ideal te espera', subheadline: 'Somos especialistas en encontrar la propiedad perfecta para ti', ctaText: 'Contactar por WhatsApp', textAlign: 'center' },
  about: { title: 'Sobre nosotros', text: 'Somos una agencia inmobiliaria con amplia experiencia en el mercado. Nuestro equipo de profesionales está dedicado a encontrar la propiedad perfecta para cada cliente.' },
  stats: { title: '', items: [{ value: '15+', label: 'Años de experiencia' }, { value: '500+', label: 'Propiedades vendidas' }, { value: '300+', label: 'Clientes satisfechos' }] },
  services: { title: 'Nuestros servicios', items: [{ icon: '🏠', title: 'Compraventa', description: 'Gestionamos la compra y venta de tu propiedad' }, { icon: '🔑', title: 'Alquiler', description: 'Te ayudamos a encontrar el inquilino ideal' }, { icon: '📋', title: 'Asesoramiento', description: 'Te asesoramos en todo el proceso inmobiliario' }] },
  properties: { title: 'Nuestras propiedades', filter: 'all', maxItems: 9, sortOrder: 'newest', columns: 3 },
  testimonials: { title: 'Lo que dicen nuestros clientes', items: [{ name: 'María García', text: 'Excelente servicio, encontraron mi piso ideal en tiempo récord.', rating: 5 }] },
  contact: { title: '¿Hablamos?', subtitle: 'Estamos aquí para ayudarte a encontrar tu propiedad ideal', showPhone: true, showEmail: true, showAddress: true, showSchedule: true, showSocial: true, showWhatsapp: true },
  map: { mapUrl: '', height: 400 },
  text: { content: 'Escribe aquí tu texto...', textAlign: 'left', fontSize: 'base' },
  image: { imageUrl: '', altText: '', width: 'full', caption: '' },
  divider: { style: 'line', spacing: 'md' },
};

const DEFAULT_GLOBAL = {
  primaryColor: '#003366', accentColor: '#2ECC71', fontFamily: 'system',
  buttonRadius: 'medium', logoUrl: '', logoPosition: 'left', logoSize: 'medium',
  showPrices: true, showWhatsappFloat: true,
  companyName: '', phone: '', whatsapp: '', email: '', address: '', scheduleText: '',
  instagram: '', facebook: '', linkedin: '', tiktok: '', youtube: '',
  metaTitle: '', metaDescription: '', googleAnalyticsId: '',
  slug: '', published: false,
};

const genId = () => Math.random().toString(36).slice(2, 10);
const makeSection = type => ({ id: genId(), type, props: { ...DEFAULTS[type] } });

const DEFAULT_SECTIONS = [makeSection('hero'), makeSection('properties'), makeSection('contact')];

// ── CANVAS SECTION RENDERS ──────────────────────────────────────────────

function fmtPrice(p) {
  return p ? Number(p).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : '';
}

function filterProps(props, p) {
  return props
    .filter(pr => p.filter === 'sale' ? pr.transaction_type === 'sale' : p.filter === 'rent' ? pr.transaction_type === 'rent' : true)
    .sort((a, b) => p.sortOrder === 'price_asc' ? (Number(a.price)||0)-(Number(b.price)||0) : p.sortOrder === 'price_desc' ? (Number(b.price)||0)-(Number(a.price)||0) : (b.id||0)-(a.id||0));
}

function renderSection(s, g, properties) {
  const p = s.props;
  const pc = g.primaryColor || '#003366';
  const ac = g.accentColor || '#2ECC71';
  const br = getBR(g.buttonRadius);

  switch (s.type) {
    case 'hero': return (
      <div style={{ background: `linear-gradient(135deg, ${pc} 0%, #0d1b2a 100%)`, padding: '64px 40px', textAlign: p.textAlign || 'center', color: 'white' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>{p.headline}</h2>
        {p.subheadline && <p style={{ fontSize: '1.05rem', opacity: 0.85, maxWidth: 560, margin: p.textAlign === 'center' ? '0 auto 24px' : '0 0 24px' }}>{p.subheadline}</p>}
        {p.ctaText && <span style={{ background: ac, color: 'white', padding: '12px 28px', borderRadius: br, fontWeight: 700, display: 'inline-block', fontSize: '0.95rem', cursor: 'default' }}>{p.ctaText}</span>}
      </div>
    );
    case 'about': return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 40px' }}>
        {p.title && <h2 style={{ color: pc, fontSize: '1.9rem', fontWeight: 800, marginBottom: 20 }}>{p.title}</h2>}
        <p style={{ color: '#444', fontSize: '1.05rem', lineHeight: 1.8, margin: 0 }}>{p.text}</p>
      </div>
    );
    case 'stats': return (
      <div style={{ background: pc, padding: '48px 40px' }}>
        {p.title && <h2 style={{ color: 'white', textAlign: 'center', marginBottom: 28, fontSize: '1.5rem' }}>{p.title}</h2>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 56, flexWrap: 'wrap' }}>
          {(p.items||[]).map((item,i) => (
            <div key={i} style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 800 }}>{item.value}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: 6 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
    case 'services': return (
      <div style={{ padding: '56px 40px', background: '#f9f9f9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {p.title && <h2 style={{ textAlign: 'center', color: pc, fontSize: '1.9rem', marginBottom: 36 }}>{p.title}</h2>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 18 }}>
            {(p.items||[]).map((svc,i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, padding: '22px 18px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{svc.icon}</div>
                <h3 style={{ color: pc, margin: '0 0 6px', fontSize: '0.95rem' }}>{svc.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>{svc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    case 'properties': return (
      <div style={{ padding: '56px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {p.title && <h2 style={{ textAlign: 'center', color: pc, fontSize: '1.9rem', marginBottom: 36 }}>{p.title}</h2>}
          {properties.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>Las propiedades aparecerán aquí automáticamente.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(p.columns||3, 3)},1fr)`, gap: 18 }}>
              {filterProps(properties, p).slice(0, p.maxItems||9).map(pr => (
                <div key={pr.id} style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                  <div style={{ height: 140, background: `linear-gradient(135deg,${pc},#1a3a5c)`, position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 8, left: 8, background: ac, color: 'white', padding: '2px 8px', borderRadius: br, fontSize: '0.72rem', fontWeight: 700 }}>
                      {pr.transaction_type === 'sale' ? 'Venta' : 'Alquiler'}
                    </span>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '0.88rem', color: '#111' }}>{pr.title}</h3>
                    <p style={{ margin: '0 0 6px', color: '#6b7280', fontSize: '0.76rem' }}>📍 {pr.city}</p>
                    <div style={{ display: 'flex', gap: 8, fontSize: '0.74rem', color: '#555' }}>
                      {pr.bedrooms && <span>🛏 {pr.bedrooms}</span>}
                      {pr.square_meters && <span>📐 {pr.square_meters}m²</span>}
                    </div>
                    {g.showPrices && pr.price && <div style={{ fontSize: '1rem', fontWeight: 700, color: ac, marginTop: 6 }}>{fmtPrice(pr.price)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
    case 'testimonials': return (
      <div style={{ background: '#f9f9f9', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {p.title && <h2 style={{ textAlign: 'center', color: pc, fontSize: '1.9rem', marginBottom: 36 }}>{p.title}</h2>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
            {(p.items||[]).map((t,i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <div style={{ color: '#f59e0b', marginBottom: 8 }}>{'★'.repeat(t.rating||5)}</div>
                <p style={{ color: '#374151', fontSize: '0.93rem', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 12px' }}>"{t.text}"</p>
                <div style={{ fontWeight: 700, color: pc, fontSize: '0.85rem' }}>— {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    case 'contact': return (
      <div style={{ background: pc, color: 'white', padding: '56px 40px', textAlign: 'center' }}>
        {p.title && <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>{p.title}</h2>}
        {p.subtitle && <p style={{ opacity: 0.85, marginBottom: 24, maxWidth: 560, margin: '0 auto 24px' }}>{p.subtitle}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', fontSize: '0.92rem' }}>
          {p.showPhone && g.phone && <span>📞 {g.phone}</span>}
          {p.showEmail && g.email && <span>✉️ {g.email}</span>}
          {p.showAddress && g.address && <span>📍 {g.address}</span>}
          {p.showSchedule && g.scheduleText && <span>🕐 {g.scheduleText}</span>}
        </div>
        {p.showWhatsapp && g.whatsapp && (
          <div style={{ marginTop: 20 }}>
            <span style={{ background: '#25d366', color: 'white', padding: '10px 24px', borderRadius: br, fontWeight: 700, display: 'inline-block' }}>WhatsApp</span>
          </div>
        )}
      </div>
    );
    case 'map': return p.mapUrl ? (
      <div style={{ height: p.height||400 }}>
        <iframe src={p.mapUrl} width="100%" height="100%" style={{ border: 0 }} title="Mapa" />
      </div>
    ) : (
      <div style={{ height: 160, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: '2rem' }}>📍</span>
        <span style={{ fontSize: '0.9rem' }}>Introduce la URL del mapa en las propiedades</span>
      </div>
    );
    case 'text': return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 40px', textAlign: p.textAlign||'left' }}>
        <p style={{ color: '#374151', fontSize: p.fontSize === 'lg' ? '1.2rem' : p.fontSize === 'sm' ? '0.88rem' : '1rem', lineHeight: 1.85, margin: 0 }}>{p.content}</p>
      </div>
    );
    case 'image': return (
      <div style={{ textAlign: 'center', padding: '20px 40px' }}>
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.altText||''} style={{ maxWidth: p.width === 'contained' ? 800 : '100%', maxHeight: 520, objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          <div style={{ height: 180, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', borderRadius: 8, fontSize: '2rem', flexDirection: 'column', gap: 8 }}>
            <span>🖼️</span><span style={{ fontSize: '0.9rem' }}>Añade la URL de la imagen</span>
          </div>
        )}
        {p.caption && <p style={{ color: '#6b7280', fontSize: '0.84rem', marginTop: 8 }}>{p.caption}</p>}
      </div>
    );
    case 'divider': {
      const sp = p.spacing === 'lg' ? '40px' : p.spacing === 'sm' ? '6px' : '18px';
      return (
        <div style={{ padding: `${sp} 40px` }}>
          {p.style === 'line' && <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />}
          {p.style === 'thick' && <hr style={{ border: 'none', borderTop: `3px solid ${ac}`, margin: 0 }} />}
          {p.style === 'dots' && <div style={{ textAlign: 'center', color: '#d1d5db', letterSpacing: 8, fontSize: '1.2rem' }}>• • •</div>}
        </div>
      );
    }
    default: return null;
  }
}

// ── SECTION EDITOR PANEL ──────────────────────────────────────────────

function upItem(arr, i, key, val) {
  const next = [...arr]; next[i] = { ...next[i], [key]: val }; return next;
}

function Field({ label, hint, children }) {
  return (
    <div className="wbe-prop-group">
      <label>{label}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

function AlignBtns({ value, onChange }) {
  return (
    <div className="wbe-align-btns">
      {[['left','⬅'],['center','↔'],['right','➡']].map(([v,l]) => (
        <button key={v} className={value===v?'active':''} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

function SizeBtns({ options, value, onChange }) {
  return (
    <div className="wbe-size-btns">
      {options.map(([v,l]) => (
        <button key={v} className={`wbe-size-btn${value===v?' active':''}`} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

function SectionEditorPanel({ section, onChange }) {
  const p = section.props;
  const up = (key, val) => onChange({ ...section, props: { ...p, [key]: val } });

  switch (section.type) {
    case 'hero': return (
      <div className="wbe-props">
        <Field label="Titular principal"><input value={p.headline} onChange={e => up('headline', e.target.value)} /></Field>
        <Field label="Subtítulo"><textarea value={p.subheadline} onChange={e => up('subheadline', e.target.value)} rows={2} /></Field>
        <Field label="Texto del botón CTA"><input value={p.ctaText} onChange={e => up('ctaText', e.target.value)} /></Field>
        <Field label="Alineación"><AlignBtns value={p.textAlign} onChange={v => up('textAlign', v)} /></Field>
      </div>
    );
    case 'about': return (
      <div className="wbe-props">
        <Field label="Título"><input value={p.title} onChange={e => up('title', e.target.value)} /></Field>
        <Field label="Texto"><textarea value={p.text} onChange={e => up('text', e.target.value)} rows={6} /></Field>
      </div>
    );
    case 'stats': return (
      <div className="wbe-props">
        <Field label="Título (opcional)"><input value={p.title||''} onChange={e => up('title', e.target.value)} /></Field>
        {(p.items||[]).map((item,i) => (
          <div key={i} className="wbe-stat-row">
            <div className="wbe-prop-group">
              <label>Valor {i+1}</label>
              <input value={item.value} onChange={e => up('items', upItem(p.items,i,'value',e.target.value))} placeholder="15+" />
            </div>
            <div className="wbe-prop-group">
              <label>Etiqueta {i+1}</label>
              <input value={item.label} onChange={e => up('items', upItem(p.items,i,'label',e.target.value))} placeholder="Años de experiencia" />
            </div>
            <button className="wbe-del-inline" onClick={() => up('items', p.items.filter((_,idx) => idx!==i))}>✕</button>
          </div>
        ))}
        {(p.items||[]).length < 5 && <button className="wbe-add-item-btn" onClick={() => up('items', [...(p.items||[]), {value:'',label:''}])}>+ Añadir estadística</button>}
      </div>
    );
    case 'services': return (
      <div className="wbe-props">
        <Field label="Título"><input value={p.title} onChange={e => up('title', e.target.value)} /></Field>
        {(p.items||[]).map((svc,i) => (
          <div key={i} className="wbe-item-box">
            <div className="wbe-item-box-header">
              <input value={svc.icon} onChange={e => up('items', upItem(p.items,i,'icon',e.target.value))} className="wbe-emoji-input" maxLength={2} />
              <input value={svc.title} onChange={e => up('items', upItem(p.items,i,'title',e.target.value))} placeholder="Nombre del servicio" />
              <button className="wbe-del-btn" onClick={() => up('items', p.items.filter((_,idx) => idx!==i))}>✕</button>
            </div>
            <input value={svc.description} onChange={e => up('items', upItem(p.items,i,'description',e.target.value))} placeholder="Descripción" className="wbe-full-w" />
          </div>
        ))}
        {(p.items||[]).length < 9 && <button className="wbe-add-item-btn" onClick={() => up('items', [...(p.items||[]),{icon:'✨',title:'',description:''}])}>+ Añadir servicio</button>}
      </div>
    );
    case 'properties': return (
      <div className="wbe-props">
        <Field label="Título"><input value={p.title} onChange={e => up('title', e.target.value)} /></Field>
        <Field label="Filtrar">
          <select value={p.filter} onChange={e => up('filter', e.target.value)} className="wbe-select">
            <option value="all">Todas (venta y alquiler)</option>
            <option value="sale">Solo en venta</option>
            <option value="rent">Solo en alquiler</option>
          </select>
        </Field>
        <Field label="Máximo a mostrar">
          <select value={p.maxItems} onChange={e => up('maxItems', Number(e.target.value))} className="wbe-select">
            {[3,6,9,12,16,24].map(n => <option key={n} value={n}>{n} propiedades</option>)}
          </select>
        </Field>
        <Field label="Ordenar por">
          <select value={p.sortOrder} onChange={e => up('sortOrder', e.target.value)} className="wbe-select">
            <option value="newest">Más recientes primero</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </Field>
        <Field label="Columnas">
          <SizeBtns options={[['2','2'],['3','3'],['4','4']]} value={String(p.columns||3)} onChange={v => up('columns', Number(v))} />
        </Field>
      </div>
    );
    case 'testimonials': return (
      <div className="wbe-props">
        <Field label="Título"><input value={p.title} onChange={e => up('title', e.target.value)} /></Field>
        {(p.items||[]).map((t,i) => (
          <div key={i} className="wbe-item-box">
            <div className="wbe-item-box-header">
              <input value={t.name} onChange={e => up('items', upItem(p.items,i,'name',e.target.value))} placeholder="Nombre del cliente" />
              <div className="wbe-stars-inline">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => up('items', upItem(p.items,i,'rating',star))} style={{ background:'none',border:'none',cursor:'pointer',color:star<=(t.rating||5)?'#f59e0b':'#d1d5db',fontSize:'1rem',padding:1 }}>★</button>
                ))}
              </div>
              <button className="wbe-del-btn" onClick={() => up('items', p.items.filter((_,idx) => idx!==i))}>✕</button>
            </div>
            <textarea value={t.text} onChange={e => up('items', upItem(p.items,i,'text',e.target.value))} placeholder="Testimonio del cliente..." rows={2} className="wbe-full-w" />
          </div>
        ))}
        {(p.items||[]).length < 9 && <button className="wbe-add-item-btn" onClick={() => up('items', [...(p.items||[]),{name:'',text:'',rating:5}])}>+ Añadir testimonio</button>}
      </div>
    );
    case 'contact': return (
      <div className="wbe-props">
        <Field label="Título"><input value={p.title} onChange={e => up('title', e.target.value)} /></Field>
        <Field label="Subtítulo"><input value={p.subtitle||''} onChange={e => up('subtitle', e.target.value)} /></Field>
        <div className="wbe-prop-section">Mostrar en esta sección</div>
        {[['showPhone','📞 Teléfono'],['showWhatsapp','💬 WhatsApp'],['showEmail','✉️ Email'],['showAddress','📍 Dirección'],['showSchedule','🕐 Horario'],['showSocial','📱 Redes sociales']].map(([key,label]) => (
          <div key={key} className="wbe-toggle-row">
            <span>{label}</span>
            <button className={`wbe-toggle${p[key]?' on':''}`} onClick={() => up(key, !p[key])}>{p[key]?'Sí':'No'}</button>
          </div>
        ))}
      </div>
    );
    case 'map': return (
      <div className="wbe-props">
        <Field label="URL del mapa (Google Maps embed)" hint="Google Maps → Compartir → Incorporar un mapa → copia el src del iframe">
          <textarea value={p.mapUrl||''} onChange={e => up('mapUrl', e.target.value)} rows={3} placeholder="https://www.google.com/maps/embed?pb=..." />
        </Field>
        <Field label="Altura del mapa">
          <SizeBtns options={[['250','250px'],['350','350px'],['450','450px'],['550','550px']]} value={String(p.height||400)} onChange={v => up('height', Number(v))} />
        </Field>
      </div>
    );
    case 'text': return (
      <div className="wbe-props">
        <Field label="Contenido"><textarea value={p.content} onChange={e => up('content', e.target.value)} rows={7} /></Field>
        <Field label="Alineación"><AlignBtns value={p.textAlign} onChange={v => up('textAlign', v)} /></Field>
        <Field label="Tamaño de letra">
          <SizeBtns options={[['sm','Pequeño'],['base','Normal'],['lg','Grande']]} value={p.fontSize||'base'} onChange={v => up('fontSize', v)} />
        </Field>
      </div>
    );
    case 'image': return (
      <div className="wbe-props">
        <Field label="URL de la imagen"><input value={p.imageUrl||''} onChange={e => up('imageUrl', e.target.value)} placeholder="https://..." /></Field>
        <Field label="Texto alternativo (SEO)"><input value={p.altText||''} onChange={e => up('altText', e.target.value)} /></Field>
        <Field label="Pie de imagen"><input value={p.caption||''} onChange={e => up('caption', e.target.value)} /></Field>
        <Field label="Ancho">
          <SizeBtns options={[['contained','Contenido'],['full','Completo']]} value={p.width||'full'} onChange={v => up('width', v)} />
        </Field>
      </div>
    );
    case 'divider': return (
      <div className="wbe-props">
        <Field label="Estilo">
          <SizeBtns options={[['line','Línea'],['thick','Grueso'],['dots','Puntos'],['space','Espacio']]} value={p.style||'line'} onChange={v => up('style', v)} />
        </Field>
        <Field label="Espaciado">
          <SizeBtns options={[['sm','Pequeño'],['md','Normal'],['lg','Grande']]} value={p.spacing||'md'} onChange={v => up('spacing', v)} />
        </Field>
      </div>
    );
    default: return <p style={{ color: '#9ca3af', textAlign: 'center', padding: 24 }}>Editor no disponible</p>;
  }
}

// ── GLOBAL EDITOR ──────────────────────────────────────────────────────

function GlobalEditor({ g, setG, onSave, saving }) {
  const [tab, setTab] = useState('design');
  const logoInputRef = useRef(null);
  const set = (key, val) => setG(prev => ({ ...prev, [key]: val }));

  const handleLogoUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600; let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        set('logoUrl', canvas.toDataURL('image/png'));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="wbe-right-tabs">
        {[['design','🎨 Diseño'],['content','📋 Datos'],['publish','🚀 Publicar']].map(([id,label]) => (
          <button key={id} className={tab===id?'active':''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'design' && (
        <div className="wbe-props">
          <div className="wbe-prop-section">Logo</div>
          <div className="wbe-prop-group">
            {g.logoUrl && (
              <div className="wbe-logo-preview">
                <img src={g.logoUrl} alt="Logo" />
              </div>
            )}
            <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} style={{ display:'none' }} />
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button className="wbe-upload-btn" onClick={() => logoInputRef.current.click()}>
                {g.logoUrl ? '🔄 Cambiar logo' : '📁 Subir logo'}
              </button>
              {g.logoUrl && <button className="wbe-remove-btn" onClick={() => set('logoUrl','')}>Quitar</button>}
            </div>
          </div>
          <div className="wbe-prop-group">
            <label>Posición del logo</label>
            <div className="wbe-size-btns">
              {[['left','⬅ Izq.'],['center','↔ Centro'],['right','Der. ➡']].map(([v,l]) => (
                <button key={v} className={`wbe-size-btn${g.logoPosition===v?' active':''}`} onClick={() => set('logoPosition',v)}>{l}</button>
              ))}
            </div>
          </div>
          <div className="wbe-prop-group">
            <label>Tamaño del logo</label>
            <div className="wbe-size-btns">
              {[['small','S'],['medium','M'],['large','L']].map(([v,l]) => (
                <button key={v} className={`wbe-size-btn${g.logoSize===v?' active':''}`} onClick={() => set('logoSize',v)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="wbe-prop-section">Colores</div>
          <div className="wbe-prop-group">
            <label>Color principal</label>
            <div className="wbe-color-row">
              <input type="color" value={g.primaryColor} onChange={e => set('primaryColor', e.target.value)} />
              <input type="text" value={g.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="wbe-hex-input" maxLength={7} />
            </div>
            <div className="wbe-presets">
              {['#003366','#1a1a2e','#2c3e50','#8B0000','#1a472a','#4a0080','#1a237e','#bf360c','#263238'].map(c => (
                <button key={c} style={{ background:c }} onClick={() => set('primaryColor',c)} className={g.primaryColor===c?'active':''} />
              ))}
            </div>
          </div>
          <div className="wbe-prop-group">
            <label>Color de acento</label>
            <div className="wbe-color-row">
              <input type="color" value={g.accentColor} onChange={e => set('accentColor', e.target.value)} />
              <input type="text" value={g.accentColor} onChange={e => set('accentColor', e.target.value)} className="wbe-hex-input" maxLength={7} />
            </div>
            <div className="wbe-presets">
              {['#2ECC71','#e67e22','#e74c3c','#3498db','#f1c40f','#9b59b6','#1abc9c','#e91e63'].map(c => (
                <button key={c} style={{ background:c }} onClick={() => set('accentColor',c)} className={g.accentColor===c?'active':''} />
              ))}
            </div>
          </div>

          <div className="wbe-prop-section">Tipografía</div>
          <div className="wbe-prop-group">
            <label>Fuente global</label>
            <select value={g.fontFamily} onChange={e => { set('fontFamily', e.target.value); loadFont(e.target.value); }} className="wbe-select">
              {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <div className="wbe-font-preview" style={{ fontFamily: getFont(g.fontFamily) }}>
              El rápido zorro marrón salta sobre el perro
            </div>
          </div>

          <div className="wbe-prop-section">Botones</div>
          <div className="wbe-prop-group">
            <div className="wbe-size-btns">
              {[['square','Cuadrado'],['medium','Normal'],['round','Redondeado']].map(([v,l]) => (
                <button key={v} className={`wbe-size-btn${g.buttonRadius===v?' active':''}`} onClick={() => set('buttonRadius',v)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="wbe-prop-section">Opciones</div>
          <div className="wbe-toggle-row">
            <span>Mostrar precios</span>
            <button className={`wbe-toggle${g.showPrices?' on':''}`} onClick={() => set('showPrices',!g.showPrices)}>{g.showPrices?'Sí':'No'}</button>
          </div>
          <div className="wbe-toggle-row">
            <span>Botón WhatsApp flotante</span>
            <button className={`wbe-toggle${g.showWhatsappFloat!==false?' on':''}`} onClick={() => set('showWhatsappFloat',!g.showWhatsappFloat)}>{g.showWhatsappFloat!==false?'Sí':'No'}</button>
          </div>
        </div>
      )}

      {tab === 'content' && (
        <div className="wbe-props">
          <div className="wbe-prop-section">Agencia</div>
          <div className="wbe-prop-group"><label>Nombre de la agencia</label><input value={g.companyName||''} onChange={e => set('companyName', e.target.value)} placeholder="Mi Agencia Inmobiliaria" /></div>
          <div className="wbe-prop-section">Contacto</div>
          {[['phone','Teléfono','+34 600 000 000'],['whatsapp','WhatsApp','+34 600 000 000'],['email','Email','info@agencia.com','email'],['address','Dirección','Calle Principal 1, Madrid'],['scheduleText','Horario','Lun–Vie 9–20h']].map(([key,label,ph,type]) => (
            <div key={key} className="wbe-prop-group"><label>{label}</label><input type={type||'text'} value={g[key]||''} onChange={e => set(key, e.target.value)} placeholder={ph} /></div>
          ))}
          <div className="wbe-prop-section">Redes sociales</div>
          {[['instagram','📷 Instagram','@miagencia'],['facebook','👤 Facebook','URL o nombre'],['linkedin','💼 LinkedIn','URL o nombre'],['tiktok','🎵 TikTok','@miagencia'],['youtube','▶️ YouTube','URL del canal']].map(([key,label,ph]) => (
            <div key={key} className="wbe-prop-group"><label>{label}</label><input value={g[key]||''} onChange={e => set(key, e.target.value)} placeholder={ph} /></div>
          ))}
        </div>
      )}

      {tab === 'publish' && (
        <div className="wbe-props">
          <div className="wbe-prop-section">SEO</div>
          <div className="wbe-prop-group">
            <label>Título SEO</label>
            <input value={g.metaTitle||''} onChange={e => set('metaTitle', e.target.value)} placeholder={`${g.companyName||'Tu Agencia'} — Inmobiliaria`} maxLength={70} />
            <small>{(g.metaTitle||'').length}/70 caracteres</small>
          </div>
          <div className="wbe-prop-group">
            <label>Descripción SEO</label>
            <textarea value={g.metaDescription||''} onChange={e => set('metaDescription', e.target.value)} rows={3} maxLength={160} placeholder="Descripción breve de tu agencia..." />
            <small>{(g.metaDescription||'').length}/160 caracteres</small>
          </div>
          <div className="wbe-prop-group">
            <label>Google Analytics ID</label>
            <input value={g.googleAnalyticsId||''} onChange={e => set('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" />
          </div>

          <div className="wbe-prop-section">URL de tu página</div>
          <div className="wbe-prop-group">
            <label>Slug (solo letras, números y guiones)</label>
            <div className="wbe-slug-row">
              <span className="wbe-slug-prefix">habitaclick.es/sitio/</span>
              <input value={g.slug||''} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))} placeholder="mi-agencia" maxLength={40} />
            </div>
          </div>

          <div className="wbe-publish-area">
            <button className={`wbe-publish-btn${g.published?' published':''}`} onClick={() => onSave(true)} disabled={saving || !g.slug || !g.companyName}>
              {g.published ? '✓ Publicada — Republicar' : '🚀 Publicar página'}
            </button>
            {(!g.slug || !g.companyName) && <p className="wbe-warn">Completa el nombre y la URL para publicar</p>}
            {g.published && g.slug && (
              <a href={`/sitio/${g.slug}`} target="_blank" rel="noreferrer" className="wbe-visit-link">Ver mi página →</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────

export default function WebsiteBuilder({ onToast, properties = [] }) {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [global, setGlobal] = useState(DEFAULT_GLOBAL);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/api/v1/website/settings`, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          const s = d.settings;
          if (s.sections?.length) setSections(s.sections);
          const gData = {};
          Object.keys(DEFAULT_GLOBAL).forEach(k => { if (s[k] !== undefined) gData[k] = s[k]; });
          setGlobal(prev => ({ ...prev, ...gData }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadFont(global.fontFamily); }, [global.fontFamily]);

  const selectedSection = sections.find(s => s.id === selectedId) || null;

  const save = async (publish = null) => {
    setSaving(true);
    const toSave = { ...global, sections, published: publish !== null ? publish : global.published };
    if (publish !== null) setGlobal(prev => ({ ...prev, published: publish }));
    try {
      const res = await fetch(`${API}/api/v1/website/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(toSave)
      });
      if (res.ok) onToast('success', publish ? 'Página publicada' : 'Guardado');
      else { const d = await res.json(); onToast('error', d.error || 'Error'); }
    } catch { onToast('error', 'Error de conexión'); }
    setSaving(false);
  };

  const updateSection = updated => setSections(prev => prev.map(s => s.id === updated.id ? updated : s));

  const moveSection = (idx, dir) => {
    const next = [...sections]; const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setSections(next);
  };

  const deleteSection = id => {
    setSections(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateSection = sec => {
    const dup = { ...sec, id: genId(), props: { ...sec.props } };
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === sec.id);
      const next = [...prev]; next.splice(idx + 1, 0, dup); return next;
    });
    setSelectedId(dup.id);
  };

  const addSection = type => {
    const ns = makeSection(type);
    setSections(prev => [...prev, ns]);
    setSelectedId(ns.id);
    setShowAddMenu(false);
  };

  const onDrop = () => {
    if (dragFrom === null || dragOver === null || dragFrom === dragOver) {
      setDragFrom(null); setDragOver(null); return;
    }
    const next = [...sections];
    const [moved] = next.splice(dragFrom, 1);
    next.splice(dragOver, 0, moved);
    setSections(next); setDragFrom(null); setDragOver(null);
  };

  const logoH = global.logoSize === 'small' ? 32 : global.logoSize === 'large' ? 56 : 42;

  if (loading) return <div className="wbe-loading">Cargando editor...</div>;

  return (
    <div className="wbe-layout">
      {/* Toolbar */}
      <div className="wbe-toolbar">
        <div className="wbe-toolbar-left">
          <span className="wbe-toolbar-title">🌐 Editor de página web</span>
          {global.companyName && <span className="wbe-toolbar-sub">{global.companyName}</span>}
        </div>
        <div className="wbe-toolbar-right">
          {global.published && global.slug && (
            <a href={`/sitio/${global.slug}`} target="_blank" rel="noreferrer" className="wbe-btn-outline">Ver página →</a>
          )}
          <button className="wbe-btn-secondary" onClick={() => save()} disabled={saving}>{saving?'Guardando…':'💾 Guardar'}</button>
          <button className={`wbe-btn-primary${global.published?' published':''}`} onClick={() => save(true)} disabled={saving||!global.slug||!global.companyName}>
            {global.published ? '✓ Publicada' : '🚀 Publicar'}
          </button>
        </div>
      </div>

      <div className="wbe-body">
        {/* Left panel */}
        <div className="wbe-left">
          <div className="wbe-left-header">
            <span>Secciones</span>
            <button className="wbe-add-section-btn" onClick={() => setShowAddMenu(v => !v)}>+ Añadir</button>
          </div>

          {showAddMenu && (
            <div className="wbe-add-menu">
              {SECTION_TYPES.map(st => (
                <button key={st.type} className="wbe-add-menu-item" onClick={() => addSection(st.type)}>
                  <span>{st.icon}</span> {st.label}
                </button>
              ))}
            </div>
          )}

          <div className="wbe-section-list" onDragEnd={onDrop}>
            {sections.map((s, idx) => {
              const ti = SECTION_TYPES.find(t => t.type === s.type);
              return (
                <div
                  key={s.id}
                  className={`wbe-section-row${selectedId===s.id?' selected':''}${dragOver===idx?' drag-over':''}`}
                  onClick={() => setSelectedId(s.id)}
                  draggable
                  onDragStart={() => setDragFrom(idx)}
                  onDragOver={e => { e.preventDefault(); if (dragFrom !== null && dragFrom !== idx) setDragOver(idx); }}
                >
                  <span className="wbe-drag-handle" title="Arrastrar para mover">⠿</span>
                  <span className="wbe-row-icon">{ti?.icon}</span>
                  <span className="wbe-row-label">{ti?.label}</span>
                  <div className="wbe-row-actions" onClick={e => e.stopPropagation()}>
                    <button onClick={() => moveSection(idx,-1)} disabled={idx===0} title="Subir">↑</button>
                    <button onClick={() => moveSection(idx,1)} disabled={idx===sections.length-1} title="Bajar">↓</button>
                    <button onClick={() => duplicateSection(s)} title="Duplicar">⧉</button>
                    <button onClick={() => deleteSection(s.id)} title="Eliminar" className="wbe-del">✕</button>
                  </div>
                </div>
              );
            })}
          </div>

          <button className={`wbe-global-btn${!selectedId?' active':''}`} onClick={() => setSelectedId(null)}>
            ⚙️ Ajustes generales
          </button>
        </div>

        {/* Canvas */}
        <div className="wbe-canvas-wrap" onClick={() => setShowAddMenu(false)}>
          {/* Header preview */}
          <div className="wbe-page-header" style={{ background: global.primaryColor, fontFamily: getFont(global.fontFamily) }}>
            <div className={`wbe-page-header-inner logo-${global.logoPosition||'left'}`}>
              <div className="wbe-header-logo">
                {global.logoUrl
                  ? <img src={global.logoUrl} alt={global.companyName} style={{ height: logoH, objectFit: 'contain' }} />
                  : <span style={{ color:'white', fontWeight:800, fontSize:'1.1rem' }}>{global.companyName||'Mi Agencia'}</span>
                }
              </div>
              <div className="wbe-header-contact">
                {global.phone && <span style={{ color:'rgba(255,255,255,0.9)', fontSize:'0.85rem' }}>📞 {global.phone}</span>}
                {global.whatsapp && <span style={{ background:'#25d366', color:'white', padding:'5px 12px', borderRadius: getBR(global.buttonRadius), fontSize:'0.82rem', fontWeight:600 }}>WhatsApp</span>}
              </div>
            </div>
          </div>

          {/* Sections canvas */}
          <div style={{ fontFamily: getFont(global.fontFamily) }}>
            {sections.length === 0 && (
              <div className="wbe-canvas-empty">
                <div>🏗️</div>
                <p>Tu página está vacía</p>
                <button onClick={() => setShowAddMenu(true)}>+ Añadir primera sección</button>
              </div>
            )}
            {sections.map(s => (
              <div
                key={s.id}
                className={`wbe-canvas-section${selectedId===s.id?' selected':''}`}
                onClick={e => { e.stopPropagation(); setSelectedId(s.id); }}
              >
                <div className="wbe-section-badge">
                  {SECTION_TYPES.find(t => t.type===s.type)?.icon} {SECTION_TYPES.find(t => t.type===s.type)?.label}
                </div>
                {renderSection(s, global, properties)}
              </div>
            ))}
          </div>

          {global.companyName && (
            <div className="wbe-page-footer" style={{ fontFamily: getFont(global.fontFamily) }}>
              © {new Date().getFullYear()} {global.companyName} · Powered by HabitaClick
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="wbe-right">
          {selectedSection ? (
            <>
              <div className="wbe-right-header">
                <span>{SECTION_TYPES.find(t=>t.type===selectedSection.type)?.icon} {SECTION_TYPES.find(t=>t.type===selectedSection.type)?.label}</span>
                <button onClick={() => setSelectedId(null)} title="Cerrar panel">✕</button>
              </div>
              <SectionEditorPanel section={selectedSection} onChange={updateSection} />
            </>
          ) : (
            <>
              <div className="wbe-right-header">
                <span>⚙️ Ajustes generales</span>
              </div>
              <GlobalEditor g={global} setG={setGlobal} onSave={save} saving={saving} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
