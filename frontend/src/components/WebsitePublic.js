import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  inter: '"Inter", sans-serif',
  roboto: '"Roboto", sans-serif',
  opensans: '"Open Sans", sans-serif',
  montserrat: '"Montserrat", sans-serif',
  poppins: '"Poppins", sans-serif',
  lato: '"Lato", sans-serif',
  raleway: '"Raleway", sans-serif',
  nunito: '"Nunito", sans-serif',
  playfair: '"Playfair Display", Georgia, serif',
  merriweather: '"Merriweather", serif',
  georgia: 'Georgia, "Times New Roman", serif',
};

const GOOGLE_FONTS = {
  inter: 'Inter:wght@400;500;600;700;800',
  roboto: 'Roboto:wght@400;500;700;900',
  opensans: 'Open+Sans:wght@400;600;700;800',
  montserrat: 'Montserrat:wght@400;600;700;800',
  poppins: 'Poppins:wght@400;500;600;700;800',
  lato: 'Lato:wght@400;700;900',
  raleway: 'Raleway:wght@400;600;700;800',
  nunito: 'Nunito:wght@400;600;700;800',
  playfair: 'Playfair+Display:wght@400;700;800',
  merriweather: 'Merriweather:wght@400;700',
};

const BTN_RADII = { square: '3px', medium: '8px', round: '24px' };

function getFont(id) { return FONTS[id] || FONTS.system; }
function getBR(id) { return BTN_RADII[id] || '8px'; }

function fmtPrice(p) {
  return p ? Number(p).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : '';
}

function socialUrl(key, val) {
  if (!val) return null;
  if (val.startsWith('http')) return val;
  return {
    instagram: `https://instagram.com/${val.replace('@','')}`,
    facebook: `https://facebook.com/${val}`,
    linkedin: `https://linkedin.com/company/${val}`,
    tiktok: `https://tiktok.com/@${val.replace('@','')}`,
    youtube: val,
  }[key] || val;
}

function FloatingWhatsApp({ whatsapp, br }) {
  if (!whatsapp) return null;
  return (
    <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
      title="Contactar por WhatsApp"
      style={{ position:'fixed', bottom:24, right:24, width:58, height:58, background:'#25d366', borderRadius:'50%',
        display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(37,211,102,0.45)',
        textDecoration:'none', zIndex:9999, fontSize:'1.7rem', transition:'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform='scale(1.12)'}
      onMouseLeave={e => e.currentTarget.style.transform=''}>
      💬
    </a>
  );
}

function PropCard({ prop, g }) {
  const br = getBR(g.buttonRadius);
  return (
    <div style={{ background:'white', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.09)', transition:'transform 0.2s,box-shadow 0.2s', cursor:'default' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.09)'; }}>
      <div style={{ height:180, background:`linear-gradient(135deg,${g.primaryColor},#1a3a5c)`, position:'relative' }}>
        <div style={{ position:'absolute', top:10, left:10, background:g.accentColor, color:'white', padding:'3px 10px', borderRadius:br, fontSize:'0.75rem', fontWeight:700 }}>
          {prop.transaction_type==='sale'?'Venta':'Alquiler'}
        </div>
      </div>
      <div style={{ padding:16 }}>
        <h3 style={{ margin:'0 0 6px', fontSize:'1rem', color:'#111', lineHeight:1.3 }}>{prop.title}</h3>
        <p style={{ margin:'0 0 10px', color:'#6b7280', fontSize:'0.85rem' }}>📍 {prop.city}{prop.province?`, ${prop.province}`:''}</p>
        <div style={{ display:'flex', gap:12, fontSize:'0.82rem', color:'#555', marginBottom:10 }}>
          {prop.bedrooms && <span>🛏 {prop.bedrooms}</span>}
          {prop.bathrooms && <span>🚿 {prop.bathrooms}</span>}
          {prop.square_meters && <span>📐 {prop.square_meters} m²</span>}
        </div>
        {g.showPrices && prop.price && <div style={{ fontSize:'1.2rem', fontWeight:700, color:g.accentColor }}>{fmtPrice(prop.price)}</div>}
      </div>
    </div>
  );
}

function filterProps(props, p) {
  return props
    .filter(pr => p.filter==='sale' ? pr.transaction_type==='sale' : p.filter==='rent' ? pr.transaction_type==='rent' : true)
    .sort((a,b) => p.sortOrder==='price_asc' ? (Number(a.price)||0)-(Number(b.price)||0) : p.sortOrder==='price_desc' ? (Number(b.price)||0)-(Number(a.price)||0) : (b.id||0)-(a.id||0));
}

function SocialLinks({ g, color }) {
  const links = [
    ['instagram','📷 Instagram'], ['facebook','👤 Facebook'], ['linkedin','💼 LinkedIn'],
    ['tiktok','🎵 TikTok'], ['youtube','▶️ YouTube'],
  ].filter(([k]) => g[k]);
  if (!links.length) return null;
  return (
    <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', marginTop:12 }}>
      {links.map(([k,l]) => (
        <a key={k} href={socialUrl(k, g[k])} target="_blank" rel="noreferrer"
          style={{ color, textDecoration:'none', fontSize:'0.88rem', opacity:0.85 }}>{l}</a>
      ))}
    </div>
  );
}

function renderSection(section, g, properties) {
  const p = section.props;
  const pc = g.primaryColor || '#003366';
  const ac = g.accentColor || '#2ECC71';
  const br = getBR(g.buttonRadius);

  switch (section.type) {
    case 'hero': return (
      <div style={{ background:`linear-gradient(135deg,${pc} 0%,#0d1b2a 100%)`, padding:'80px 40px', textAlign:p.textAlign||'center', color:'white' }}>
        <h2 style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800, margin:'0 0 16px', lineHeight:1.2 }}>{p.headline}</h2>
        {p.subheadline && <p style={{ fontSize:'1.1rem', opacity:0.9, maxWidth:600, margin:p.textAlign==='center'?'0 auto 32px':'0 0 32px' }}>{p.subheadline}</p>}
        {p.ctaText && g.whatsapp && (
          <a href={`https://wa.me/${g.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
            style={{ background:ac, color:'white', padding:'14px 32px', borderRadius:br, textDecoration:'none', fontWeight:700, fontSize:'1.05rem', display:'inline-block' }}>
            {p.ctaText}
          </a>
        )}
        {p.ctaText && !g.whatsapp && (
          <span style={{ background:ac, color:'white', padding:'14px 32px', borderRadius:br, fontWeight:700, fontSize:'1.05rem', display:'inline-block' }}>{p.ctaText}</span>
        )}
      </div>
    );
    case 'about': return (
      <div style={{ maxWidth:900, margin:'0 auto', padding:'64px 24px' }}>
        {p.title && <h2 style={{ color:pc, fontSize:'2rem', fontWeight:800, marginBottom:24 }}>{p.title}</h2>}
        <p style={{ color:'#374151', fontSize:'1.05rem', lineHeight:1.85, margin:0 }}>{p.text}</p>
      </div>
    );
    case 'stats': return (
      <div style={{ background:pc, padding:'52px 40px' }}>
        {p.title && <h2 style={{ color:'white', textAlign:'center', marginBottom:32, fontSize:'1.6rem' }}>{p.title}</h2>}
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', justifyContent:'center', gap:60, flexWrap:'wrap' }}>
          {(p.items||[]).map((item,i) => (
            <div key={i} style={{ textAlign:'center', color:'white' }}>
              <div style={{ fontSize:'2.8rem', fontWeight:800, lineHeight:1 }}>{item.value}</div>
              <div style={{ fontSize:'0.9rem', opacity:0.85, marginTop:6 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
    case 'services': return (
      <div style={{ background:'#f9f9f9', padding:'64px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          {p.title && <h2 style={{ textAlign:'center', color:pc, fontSize:'2rem', marginBottom:40 }}>{p.title}</h2>}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:24 }}>
            {(p.items||[]).map((svc,i) => (
              <div key={i} style={{ background:'white', borderRadius:14, padding:'28px 20px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:12 }}>{svc.icon}</div>
                <h3 style={{ color:pc, margin:'0 0 8px', fontSize:'1.05rem' }}>{svc.title}</h3>
                <p style={{ color:'#6b7280', fontSize:'0.88rem', margin:0, lineHeight:1.6 }}>{svc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    case 'properties': return (
      <div style={{ padding:'64px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          {p.title && <h2 style={{ textAlign:'center', color:pc, fontSize:'2rem', marginBottom:40 }}>{p.title}</h2>}
          {properties.length === 0 ? (
            <p style={{ textAlign:'center', color:'#9ca3af' }}>Próximamente publicaremos propiedades disponibles.</p>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill,minmax(${p.columns>=4?240:280}px,1fr))`, gap:24 }}>
              {filterProps(properties, p).slice(0, p.maxItems||9).map(pr => <PropCard key={pr.id} prop={pr} g={g} />)}
            </div>
          )}
        </div>
      </div>
    );
    case 'testimonials': return (
      <div style={{ background:'#f9f9f9', padding:'64px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          {p.title && <h2 style={{ textAlign:'center', color:pc, fontSize:'2rem', marginBottom:40 }}>{p.title}</h2>}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 }}>
            {(p.items||[]).map((t,i) => (
              <div key={i} style={{ background:'white', borderRadius:14, padding:24, boxShadow:'0 2px 16px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ color:'#f59e0b', fontSize:'1.1rem' }}>{'★'.repeat(t.rating||5)}{'☆'.repeat(5-(t.rating||5))}</div>
                <p style={{ color:'#374151', fontSize:'0.95rem', lineHeight:1.7, margin:0, fontStyle:'italic', flex:1 }}>"{t.text}"</p>
                <div style={{ fontWeight:700, color:pc, fontSize:'0.9rem' }}>— {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    case 'contact': return (
      <div style={{ background:pc, color:'white', padding:'64px 40px', textAlign:'center' }}>
        {p.title && <h2 style={{ fontSize:'2rem', marginBottom:10 }}>{p.title}</h2>}
        {p.subtitle && <p style={{ opacity:0.85, marginBottom:28, maxWidth:560, margin:'0 auto 28px' }}>{p.subtitle}</p>}
        <div style={{ display:'flex', justifyContent:'center', gap:20, flexWrap:'wrap', fontSize:'0.95rem', marginBottom:20 }}>
          {p.showPhone && g.phone && <span>📞 {g.phone}</span>}
          {p.showEmail && g.email && <span>✉️ {g.email}</span>}
          {p.showAddress && g.address && <span>📍 {g.address}</span>}
          {p.showSchedule && g.scheduleText && <span>🕐 {g.scheduleText}</span>}
        </div>
        {p.showWhatsapp && g.whatsapp && (
          <a href={`https://wa.me/${g.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
            style={{ background:'#25d366', color:'white', padding:'12px 28px', borderRadius:br, textDecoration:'none', fontWeight:700, display:'inline-block', marginBottom:16 }}>
            WhatsApp
          </a>
        )}
        {p.showSocial && <SocialLinks g={g} color="rgba(255,255,255,0.85)" />}
      </div>
    );
    case 'map': return p.mapUrl ? (
      <div style={{ height:p.height||400 }}>
        <iframe src={p.mapUrl} width="100%" height="100%" style={{ border:0 }} allowFullScreen loading="lazy" title="Mapa" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    ) : null;
    case 'text': return (
      <div style={{ maxWidth:900, margin:'0 auto', padding:'48px 24px', textAlign:p.textAlign||'left' }}>
        <p style={{ color:'#374151', fontSize:p.fontSize==='lg'?'1.2rem':p.fontSize==='sm'?'0.9rem':'1rem', lineHeight:1.85, margin:0 }}>
          {p.content}
        </p>
      </div>
    );
    case 'image': return p.imageUrl ? (
      <div style={{ textAlign:'center', padding:'24px 40px' }}>
        <img src={p.imageUrl} alt={p.altText||''} style={{ maxWidth:p.width==='contained'?800:'100%', maxHeight:560, objectFit:'cover', borderRadius:8 }} />
        {p.caption && <p style={{ color:'#6b7280', fontSize:'0.85rem', marginTop:10 }}>{p.caption}</p>}
      </div>
    ) : null;
    case 'divider': {
      const sp = p.spacing==='lg'?'44px':p.spacing==='sm'?'8px':'22px';
      return (
        <div style={{ padding:`${sp} 40px` }}>
          {p.style==='line' && <hr style={{ border:'none', borderTop:'1px solid #e5e7eb', margin:0 }} />}
          {p.style==='thick' && <hr style={{ border:'none', borderTop:`3px solid ${ac}`, margin:0 }} />}
          {p.style==='dots' && <div style={{ textAlign:'center', color:'#d1d5db', letterSpacing:8, fontSize:'1.3rem' }}>• • •</div>}
        </div>
      );
    }
    default: return null;
  }
}

function PageHeader({ g }) {
  const pc = g.primaryColor || '#003366';
  const br = getBR(g.buttonRadius);
  const logoH = g.logoSize==='small'?32:g.logoSize==='large'?56:42;

  const logo = g.logoUrl
    ? <img src={g.logoUrl} alt={g.companyName} style={{ height:logoH, objectFit:'contain' }} />
    : <span style={{ color:'white', fontWeight:800, fontSize:'1.3rem' }}>{g.companyName||'Mi Agencia'}</span>;

  const contact = (
    <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
      {g.phone && <a href={`tel:${g.phone}`} style={{ color:'rgba(255,255,255,0.9)', textDecoration:'none', fontSize:'0.9rem' }}>📞 {g.phone}</a>}
      {g.whatsapp && <a href={`https://wa.me/${g.whatsapp.replace(/\D/g,'')}`} style={{ background:'#25d366', color:'white', padding:'6px 14px', borderRadius:br, textDecoration:'none', fontSize:'0.85rem', fontWeight:600 }} target="_blank" rel="noreferrer">WhatsApp</a>}
    </div>
  );

  const pos = g.logoPosition || 'left';
  return (
    <header style={{ background:pc, padding:'16px 40px', position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center',
      justifyContent: pos==='center' ? 'center' : 'space-between',
      flexDirection: pos==='right' ? 'row-reverse' : 'row',
      flexWrap:'wrap', gap:12
    }}>
      {logo}
      {pos !== 'center' && contact}
      {pos === 'center' && (
        <div style={{ position:'absolute', right:40, top:'50%', transform:'translateY(-50%)' }}>{contact}</div>
      )}
    </header>
  );
}

export default function WebsitePublic({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/public/website/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
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

    const gf = GOOGLE_FONTS[s.fontFamily];
    if (gf) {
      const id = `gf-${s.fontFamily}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id; link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${gf}&display=swap`;
        document.head.appendChild(link);
      }
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
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#0d1b2a', color:'white', fontFamily:'sans-serif' }}>
      Cargando...
    </div>
  );

  if (error || !data) return (
    <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f9f9f9', fontFamily:'sans-serif', gap:12 }}>
      <div style={{ fontSize:'3rem' }}>🏠</div>
      <h2 style={{ color:'#003366' }}>Página no encontrada</h2>
      <p style={{ color:'#6b7280' }}>Esta agencia no tiene página publicada todavía.</p>
    </div>
  );

  const s = data.settings || {};
  const font = getFont(s.fontFamily);

  // Filter and sort all properties once
  const allFiltered = (data.properties || [])
    .sort((a,b) => (b.id||0)-(a.id||0));

  return (
    <div style={{ fontFamily: font, background:'white', minHeight:'100vh' }}>
      <PageHeader g={s} />

      {(s.sections || []).map(section => (
        <div key={section.id}>
          {renderSection(section, s, allFiltered)}
        </div>
      ))}

      {/* Footer */}
      <footer style={{ background:'#1a1a2e', color:'rgba(255,255,255,0.45)', padding:'20px 40px', textAlign:'center', fontSize:'0.78rem', fontFamily: font }}>
        © {new Date().getFullYear()} {s.companyName} · Creado con{' '}
        <a href="https://habitaclick.es" target="_blank" rel="noreferrer" style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none' }}>HabitaClick</a>
      </footer>

      {s.showWhatsappFloat !== false && <FloatingWhatsApp whatsapp={s.whatsapp} />}
    </div>
  );
}
