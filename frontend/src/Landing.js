import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, TrendingDown, AlertCircle, CheckCircle2, Check, ChevronDown } from 'lucide-react';
import './Landing.css';

const videos = [
  '/videos/VideoLandingMadrid.mp4',
  '/videos/VideoLandingMadrid2.mp4',
  '/videos/VideoLandingMadrid3.mp4',
  '/videos/VideoLandingBarcelona4.mp4'
];

const FAQ_ITEMS = [
  {
    q: '¿Qué es un CRM inmobiliario?',
    a: 'Un CRM inmobiliario es un software de gestión específicamente diseñado para agencias y agentes inmobiliarios. Permite centralizar la cartera de inmuebles, gestionar contactos y clientes, automatizar la publicación en portales y hacer seguimiento de cada operación de compraventa o alquiler. HabitaClick es el CRM inmobiliario español creado específicamente para el mercado de España.'
  },
  {
    q: '¿Cómo funciona HabitaClick?',
    a: 'HabitaClick funciona como una plataforma central: subes tu propiedad una única vez con todas sus fotos y datos, y el sistema la publica automáticamente en Idealista, Fotocasa y el resto de portales configurados. Cualquier cambio de precio, disponibilidad o descripción se sincroniza en todos los portales de forma instantánea.'
  },
  {
    q: '¿En qué se diferencia HabitaClick de otros CRM inmobiliarios?',
    a: 'HabitaClick es un CRM inmobiliario español, desarrollado y con soporte en español, enfocado en el mercado de España. A diferencia de otros CRM genéricos adaptados, HabitaClick está diseñado desde cero para las necesidades de las agencias inmobiliarias españolas: portales locales, fiscalidad (ITP, AJD por CCAA), calculadora hipotecaria y página web propia incluida.'
  },
  {
    q: '¿Puedo publicar en Idealista y Fotocasa con HabitaClick?',
    a: 'Sí. HabitaClick se integra con Idealista, Fotocasa, Habitaclia, Pisos.com y otros portales inmobiliarios. Con un solo clic tus propiedades se publican y sincronizan automáticamente en todos los portales activos, sin necesidad de entrar en cada portal por separado.'
  },
  {
    q: '¿Tiene HabitaClick prueba gratuita?',
    a: 'Sí, HabitaClick ofrece una prueba gratuita de 45 días con acceso completo a todas las funcionalidades del plan Professional. No se requiere tarjeta de crédito y puedes cancelar en cualquier momento. Al terminar la prueba puedes elegir el plan que mejor se adapte a tu agencia.'
  },
  {
    q: '¿Es HabitaClick un CRM inmobiliario español?',
    a: 'Sí. HabitaClick es un software CRM inmobiliario desarrollado en España, con soporte técnico en castellano, integrado con los portales inmobiliarios españoles y adaptado a la normativa fiscal española (ITP/AJD por Comunidad Autónoma). Está disponible para agencias inmobiliarias en toda España: Madrid, Barcelona, Valencia, Sevilla, Málaga, Bilbao, Zaragoza y el resto de provincias.'
  },
  {
    q: '¿Cuánto cuesta el CRM inmobiliario HabitaClick?',
    a: 'HabitaClick tiene dos planes principales: Starter desde 18,99 €/mes (ideal para agentes independientes y agencias pequeñas, hasta 50 propiedades) y Professional desde 39,99 €/mes (hasta 500 propiedades, sincronización bidireccional y analytics). Para grandes agencias existe el plan Enterprise con precio personalizado. Todos los planes incluyen sincronización con portales.'
  },
  {
    q: '¿Incluye HabitaClick página web para mi inmobiliaria?',
    a: 'Sí. Los planes Professional y Enterprise incluyen una página web propia para tu inmobiliaria con dominio personalizado. La web se actualiza automáticamente con tu cartera de propiedades, sin necesidad de conocimientos técnicos. Es una herramienta adicional dentro del CRM inmobiliario HabitaClick.'
  }
];

function Landing({ onLoginClick, onSignupClick, onPolicyCookiesClick, onPolicyPrivacyClick, onSobreClick, onContactoClick }) {
  const [activeSlot, setActiveSlot] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [billing, setBilling] = useState('mensual');
  const [pricingBlur, setPricingBlur] = useState(false);

  const switchBilling = (val) => {
    if (val === billing) return;
    setPricingBlur(true);
    setTimeout(() => setBilling(val), 160);
    setTimeout(() => setPricingBlur(false), 320);
  };
  const currentIdxRef = useRef(0);
  const nextIdxRef = useRef(1);
  const videoRef0 = useRef(null);
  const videoRef1 = useRef(null);
  const preloadRef = useRef(null);
  const switchingRef = useRef(false);

  // Set page background
  useEffect(() => {
    document.documentElement.style.background = '#0d1b2a';
    document.body.style.background = '#0d1b2a';
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, []);

  // Preload next video silently
  const preloadNext = useCallback((idx) => {
    if (preloadRef.current) {
      preloadRef.current.src = videos[idx];
      preloadRef.current.load();
    }
  }, []);

  // Smooth video rotation
  useEffect(() => {
    const v0 = videoRef0.current;
    const v1 = videoRef1.current;
    if (!v0 || !v1) return;

    v0.src = videos[0];
    v0.load();
    v0.play().catch(() => {});
    preloadNext(1);

    const interval = setInterval(() => {
      if (switchingRef.current) return;
      switchingRef.current = true;

      const next = nextIdxRef.current;
      const nextVideo = activeSlot === 0 ? v1 : v0;

      // Transfer preloaded src to inactive slot
      if (preloadRef.current && preloadRef.current.src) {
        nextVideo.src = preloadRef.current.src;
      } else {
        nextVideo.src = videos[next];
        nextVideo.load();
      }

      nextVideo.play().catch(() => {});

      setActiveSlot(prev => {
        const newSlot = 1 - prev;
        // After switch, preload the one after next
        const afterNext = (next + 1) % videos.length;
        nextIdxRef.current = afterNext;
        setTimeout(() => {
          preloadNext(afterNext);
          switchingRef.current = false;
        }, 1500);
        currentIdxRef.current = next;
        return newSlot;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);  // eslint-disable-line

  // Scroll animations with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing">
      {/* Hidden preload element */}
      <video ref={preloadRef} style={{ display: 'none' }} muted preload="auto" />

      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <img src="/logos/logo.png" alt="HabitaClick - Software inmobiliario" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="header-mobile-buttons">
            <button className="btn-primary" onClick={onSignupClick}>Registrarse</button>
            <button className="btn-text" onClick={onLoginClick}>Iniciar sesión</button>
          </div>
          <div className="header-buttons">
            <button className="btn-text" onClick={onLoginClick}>Iniciar sesión</button>
            <button className="btn-primary" onClick={onSignupClick}>Comenzar gratis</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" id="inicio">
        <video
          ref={videoRef0}
          className="hero-video"
          style={{ opacity: activeSlot === 0 ? 1 : 0 }}
          muted loop playsInline preload="auto"
        />
        <video
          ref={videoRef1}
          className="hero-video"
          style={{ opacity: activeSlot === 1 ? 1 : 0 }}
          muted loop playsInline preload="auto"
        />
        <div className="hero-overlay"></div>

        <div className="hero-content animate-on-scroll">
          <h1>HabitaClick — CRM inmobiliario español para publicar en Idealista, Fotocasa y todos los portales</h1>
          <p>El CRM inmobiliario para agencias y agentes en España. Sincroniza tus propiedades automáticamente en todos los portales inmobiliarios, gestiona tu cartera y ahorra horas cada semana.</p>
          <button className="btn-primary btn-large" onClick={onSignupClick}>Comienza tu prueba gratuita</button>
          <p className="hero-subtext"><Check size={13} style={{verticalAlign:'middle',marginRight:'5px'}}/> 45 días gratis • Sin tarjeta de crédito • Cancela en cualquier momento</p>
        </div>
      </section>

      {/* Problema/Solución */}
      <section className="problem-solution" id="features">
        <h2 className="animate-on-scroll">El problema de las agencias inmobiliarias hoy</h2>
        <div className="cards-grid">
          <div className="card-problem animate-on-scroll" style={{ '--delay': '0s' }}>
            <div className="icon"><Clock size={32}/></div>
            <h3>Horas perdidas publicando manualmente</h3>
            <p>Subir cada propiedad a Idealista, Fotocasa y otros portales por separado consume horas cada semana</p>
          </div>
          <div className="card-problem animate-on-scroll" style={{ '--delay': '0.1s' }}>
            <div className="icon"><TrendingDown size={32}/></div>
            <h3>Costes elevados por portal</h3>
            <p>Pagar suscripciones independientes a cada portal inmobiliario dispara los gastos fijos de tu agencia</p>
          </div>
          <div className="card-problem animate-on-scroll" style={{ '--delay': '0.2s' }}>
            <div className="icon"><AlertCircle size={32}/></div>
            <h3>Datos desincronizados entre portales</h3>
            <p>Precios y disponibilidad diferentes en cada portal generan confusión y pérdida de clientes</p>
          </div>
        </div>

        <h2 className="animate-on-scroll" style={{ marginTop: '60px' }}>La solución: HabitaClick, el CRM inmobiliario español</h2>
        <div className="solution-list">
          <div className="solution-item animate-on-scroll" style={{ '--delay': '0s' }}>
            <div className="check"><CheckCircle2 size={20}/></div>
            <div>
              <h4>Publica en todos los portales con un solo clic</h4>
              <p>Sube tu propiedad una vez y HabitaClick la sincroniza automáticamente en todos los portales inmobiliarios</p>
            </div>
          </div>
          <div className="solution-item animate-on-scroll" style={{ '--delay': '0.1s' }}>
            <div className="check"><CheckCircle2 size={20}/></div>
            <div>
              <h4>Reduce costes hasta un 90%</h4>
              <p>Un único pago mensual desde 18,99€ en lugar de múltiples suscripciones a portales</p>
            </div>
          </div>
          <div className="solution-item animate-on-scroll" style={{ '--delay': '0.15s' }}>
            <div className="check"><CheckCircle2 size={20}/></div>
            <div>
              <h4>Propiedades siempre actualizadas en tiempo real</h4>
              <p>Cualquier cambio de precio o estado se actualiza al instante en todos los portales</p>
            </div>
          </div>
          <div className="solution-item animate-on-scroll" style={{ '--delay': '0.2s' }}>
            <div className="check"><CheckCircle2 size={20}/></div>
            <div>
              <h4>CRM inmobiliario integrado para toda tu agencia</h4>
              <p>Gestiona toda tu cartera de propiedades, clientes y agentes desde un único CRM inmobiliario en español</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portales */}
      <section className="portals" id="portales">
        <h2 className="animate-on-scroll">Integrado con los principales portales inmobiliarios</h2>
        <div className="portals-grid">
          <div className="portal-logo animate-on-scroll" style={{ '--delay': '0s' }}>Idealista</div>
          <div className="portal-logo animate-on-scroll" style={{ '--delay': '0.08s' }}>Fotocasa</div>
          <div className="portal-logo animate-on-scroll" style={{ '--delay': '0.16s' }}>Oportuna</div>
          <div className="portal-logo animate-on-scroll" style={{ '--delay': '0.24s' }}>Inmuebles24</div>
          <div className="portal-logo animate-on-scroll" style={{ '--delay': '0.32s' }}>Vivanuncios</div>
        </div>
        <p className="portals-note animate-on-scroll">Y muchos más. Nos integramos continuamente con nuevos portales inmobiliarios en España.</p>
      </section>

      {/* Planes */}
      <section className="pricing" id="pricing">
        <h2 className="animate-on-scroll">Planes simples y transparentes</h2>

        {/* Toggle mensual / anual */}
        <div className="pricing-toggle animate-on-scroll">
          <button
            className={`pt-opt${billing === 'mensual' ? ' pt-opt--active' : ''}`}
            onClick={() => switchBilling('mensual')}
          >
            Mensual
          </button>
          <button
            className={`pt-opt${billing === 'anual' ? ' pt-opt--active' : ''}`}
            onClick={() => switchBilling('anual')}
          >
            Anual
            <span className="pt-badge">−20%</span>
          </button>
        </div>
        {/* Siempre renderizado: visibility preserva el espacio y evita layout shift */}
        <p className="pricing-anual-note" style={{ visibility: billing === 'anual' ? 'visible' : 'hidden' }}>
          🎉 Pagas un año y ahorras dos meses — facturado anualmente
        </p>

        <div className={`pricing-grid${pricingBlur ? ' pricing--blurring' : ''}`}>
          <div className="pricing-card animate-on-scroll" style={{ '--delay': '0s' }}>
            <h3>Starter</h3>
            <div className="price-old" style={{ visibility: billing === 'anual' ? 'visible' : 'hidden' }}>€18,99<span>/mes</span></div>
            <div className="price">
              {billing === 'anual' ? '€15,19' : '€18,99'}
              <span>/mes</span>
            </div>
            <p className="price-yearly" style={{ visibility: billing === 'anual' ? 'visible' : 'hidden' }}>€182,28 facturado al año · ahorras €45,60</p>
            <p className="description">Para agencias pequeñas</p>
            <ul>
              <li><Check size={13}/> Hasta 50 propiedades</li>
              <li><Check size={13}/> 4 portales incluidos</li>
              <li><Check size={13}/> Sincronización automática</li>
              <li><Check size={13}/> Soporte email</li>
            </ul>
            <button className="btn-secondary" onClick={onSignupClick}>Comenzar</button>
          </div>

          <div className="pricing-card featured animate-on-scroll" style={{ '--delay': '0.1s' }}>
            <div className="badge">MÁS POPULAR</div>
            <h3>Professional</h3>
            <div className="price-old" style={{ visibility: billing === 'anual' ? 'visible' : 'hidden' }}>€39,99<span>/mes</span></div>
            <div className="price">
              {billing === 'anual' ? '€31,99' : '€39,99'}
              <span>/mes</span>
            </div>
            <p className="price-yearly" style={{ visibility: billing === 'anual' ? 'visible' : 'hidden' }}>€383,88 facturado al año · ahorras €96,00</p>
            <p className="description">Para agencias medianas</p>
            <ul>
              <li><Check size={13}/> Hasta 500 propiedades</li>
              <li><Check size={13}/> 8 portales incluidos</li>
              <li><Check size={13}/> Sincronización bidireccional</li>
              <li><Check size={13}/> Soporte prioritario</li>
              <li><Check size={13}/> Analytics avanzado</li>
            </ul>
            <button className="btn-primary" onClick={onSignupClick}>Comenzar prueba gratis</button>
          </div>

          <div className="pricing-card animate-on-scroll" style={{ '--delay': '0.2s' }}>
            <h3>Enterprise</h3>
            <div className="price">Personalizado</div>
            <p className="description">Para grandes agencias</p>
            <ul>
              <li><Check size={13}/> Propiedades ilimitadas</li>
              <li><Check size={13}/> Todos los portales</li>
              <li><Check size={13}/> Integraciones custom</li>
              <li><Check size={13}/> Soporte 24/7</li>
              <li><Check size={13}/> Dedicado account manager</li>
            </ul>
            <button className="btn-secondary" onClick={() => onContactoClick && onContactoClick()}>Contactar ventas</button>
          </div>
        </div>
      </section>

      {/* ── Funcionalidades CRM ── */}
      <section className="seo-features" id="funcionalidades">
        <h2 className="animate-on-scroll">Todo lo que incluye el CRM inmobiliario HabitaClick</h2>
        <p className="seo-features-sub animate-on-scroll">Una plataforma completa para gestionar tu agencia inmobiliaria en España</p>
        <div className="seo-features-grid">
          <div className="seo-feat-card animate-on-scroll" style={{ '--delay': '0s' }}>
            <div className="sfc-icon">🏠</div>
            <h3>Gestión de cartera de inmuebles</h3>
            <p>Gestiona pisos, casas, locales comerciales, oficinas, solares y garajes. Ficha completa con fotos, vídeos, planos y descripción por tipo de operación (venta y alquiler).</p>
          </div>
          <div className="seo-feat-card animate-on-scroll" style={{ '--delay': '0.07s' }}>
            <div className="sfc-icon">👥</div>
            <h3>CRM de contactos y clientes</h3>
            <p>Base de datos de compradores, arrendatarios y propietarios. Seguimiento de cada lead, asignación de asesores y historial de comunicaciones centralizado en el CRM.</p>
          </div>
          <div className="seo-feat-card animate-on-scroll" style={{ '--delay': '0.14s' }}>
            <div className="sfc-icon">🔄</div>
            <h3>Publicación automática en portales</h3>
            <p>Sincronización en tiempo real con Idealista, Fotocasa, Habitaclia, Pisos.com y más. Un solo clic y tu propiedad aparece en todos los portales inmobiliarios.</p>
          </div>
          <div className="seo-feat-card animate-on-scroll" style={{ '--delay': '0.21s' }}>
            <div className="sfc-icon">🧮</div>
            <h3>Calculadora hipotecaria</h3>
            <p>Calcula la cuota mensual, ITP/AJD por Comunidad Autónoma, gastos de notaría y registro. Exporta la simulación en PDF con el logo de tu inmobiliaria.</p>
          </div>
          <div className="seo-feat-card animate-on-scroll" style={{ '--delay': '0.28s' }}>
            <div className="sfc-icon">🌐</div>
            <h3>Página web para tu inmobiliaria</h3>
            <p>Web propia con dominio personalizado que se actualiza automáticamente con tu cartera. Sin necesidad de conocimientos técnicos ni contratar un diseñador web.</p>
          </div>
          <div className="seo-feat-card animate-on-scroll" style={{ '--delay': '0.35s' }}>
            <div className="sfc-icon">📍</div>
            <h3>Mapa de inmuebles</h3>
            <p>Visualiza toda tu cartera geolocalizadas en un mapa interactivo. Identifica zonas de mayor actividad y comparte la ubicación exacta de cada inmueble con tus clientes.</p>
          </div>
        </div>
      </section>

      {/* ── Comparativa ── */}
      <section className="seo-compare animate-on-scroll">
        <h2>HabitaClick frente a otros CRM inmobiliarios</h2>
        <p className="seo-compare-sub">¿Por qué elegir HabitaClick como software CRM para tu inmobiliaria?</p>
        <div className="seo-compare-grid">
          <div className="scc-col scc-col--hc">
            <div className="scc-head">HabitaClick</div>
            <ul>
              <li><Check size={14}/> CRM inmobiliario en español</li>
              <li><Check size={14}/> Integrado con portales españoles</li>
              <li><Check size={14}/> Calculadora hipotecaria incluida</li>
              <li><Check size={14}/> Página web de inmobiliaria incluida</li>
              <li><Check size={14}/> ITP/AJD por Comunidad Autónoma</li>
              <li><Check size={14}/> Soporte en castellano</li>
              <li><Check size={14}/> Sin contrato de permanencia</li>
              <li><Check size={14}/> Prueba gratis 45 días</li>
            </ul>
          </div>
          <div className="scc-col scc-col--other">
            <div className="scc-head">Otros CRM inmobiliarios</div>
            <ul>
              <li><span className="scc-x">✗</span> Interfaz en otros idiomas</li>
              <li><span className="scc-x">✗</span> Integraciones limitadas</li>
              <li><span className="scc-x">✗</span> Calculadora de pago extra</li>
              <li><span className="scc-x">✗</span> Web propia no incluida</li>
              <li><span className="scc-x">✗</span> Sin fiscalidad española</li>
              <li><span className="scc-x">✗</span> Soporte técnico en inglés</li>
              <li><span className="scc-x">✗</span> Contratos anuales</li>
              <li><span className="scc-x">✗</span> Sin periodo de prueba</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Cobertura España ── */}
      <section className="seo-cities animate-on-scroll">
        <h2>CRM inmobiliario disponible en toda España</h2>
        <p>HabitaClick es el CRM inmobiliario español utilizado por agencias inmobiliarias en las principales ciudades y provincias de España:</p>
        <div className="seo-cities-grid">
          {['Madrid','Barcelona','Valencia','Sevilla','Málaga','Bilbao','Zaragoza','Alicante',
            'Murcia','Palma de Mallorca','Las Palmas','Santa Cruz de Tenerife','Valladolid',
            'Córdoba','Almuñécar','Marbella','Torrevieja','Benidorm','Estepona','Fuengirola'
          ].map(city => (
            <span key={city} className="seo-city-tag">{city}</span>
          ))}
        </div>
        <p className="seo-cities-note">¿Tu ciudad no aparece? HabitaClick está disponible para cualquier agencia inmobiliaria en España sin restricción geográfica.</p>
      </section>

      {/* ── FAQ ── */}
      <section className="seo-faq" id="faq">
        <h2 className="animate-on-scroll">Preguntas frecuentes sobre el CRM inmobiliario HabitaClick</h2>
        <div className="seo-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`seo-faq-item${openFaq === i ? ' open' : ''}`}>
              <button
                className="seo-faq-q"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span>{item.q}</span>
                <ChevronDown size={18} className="seo-faq-chevron" />
              </button>
              <div className="seo-faq-a">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="final-cta">
        <h2 className="animate-on-scroll">¿Listo para empezar con el CRM inmobiliario HabitaClick?</h2>
        <p className="animate-on-scroll">Únete a las agencias inmobiliarias españolas que ya gestionan su CRM y publican en todos los portales automáticamente con HabitaClick. Sin complicaciones, sin costes extra.</p>
        <button className="btn-primary btn-large animate-on-scroll" onClick={onSignupClick}>Empieza gratis 45 días</button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section footer-section--brand">
            <h4>HabitaClick</h4>
            <p>El <strong>CRM inmobiliario español</strong> para agencias y agentes. Gestiona tu cartera y publica en Idealista, Fotocasa y más portales desde una sola plataforma.</p>
            <p className="footer-tagline">🇪🇸 Hecho en España · Soporte en castellano</p>
          </div>
          <div className="footer-section">
            <h4>CRM Inmobiliario</h4>
            <ul>
              <li><a href="#funcionalidades" onClick={e => { e.preventDefault(); scrollToSection('funcionalidades'); }}>Funcionalidades</a></li>
              <li><a href="#portales" onClick={e => { e.preventDefault(); scrollToSection('portales'); }}>Portales integrados</a></li>
              <li><a href="#pricing" onClick={e => { e.preventDefault(); scrollToSection('pricing'); }}>Precios</a></li>
              <li><a href="#faq" onClick={e => { e.preventDefault(); scrollToSection('faq'); }}>Preguntas frecuentes</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Empresa</h4>
            <ul>
              <li><a href="#sobre" onClick={e => { e.preventDefault(); onSobreClick && onSobreClick(); }}>Sobre nosotros</a></li>
              <li><a href="#contacto" onClick={e => { e.preventDefault(); onContactoClick && onContactoClick(); }}>Contacto</a></li>
              <li><a href="#features" onClick={e => { e.preventDefault(); scrollToSection('features'); }}>¿Por qué HabitaClick?</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); onPolicyPrivacyClick(); }}>
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); onPolicyCookiesClick(); }}>
                  Política de Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 HabitaClick — CRM Inmobiliario Español. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
