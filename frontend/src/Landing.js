import React, { useState, useEffect, useRef } from 'react';
import './Landing.css';

const videos = [
  '/videos/VideoLandingMadrid.mp4',
  '/videos/VideoLandingMadrid2.mp4',
  '/videos/VideoLandingMadrid3.mp4',
  '/videos/VideoLandingBarcelona4.mp4'
];

function Landing({ onLoginClick, onSignupClick, onPolicyCookiesClick, onPolicyPrivacyClick }) {
  const [email, setEmail] = useState('');
  const [activeSlot, setActiveSlot] = useState(0);
  const nextIndexRef = useRef(1);
  const videoRef0 = useRef(null);
  const videoRef1 = useRef(null);

  useEffect(() => {
    document.documentElement.style.background = '#0d1b2a';
    document.body.style.background = '#0d1b2a';
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlot(prev => {
        const inactive = prev;
        setTimeout(() => {
          const nextIdx = (nextIndexRef.current + 1) % videos.length;
          nextIndexRef.current = nextIdx;
          const video = inactive === 0 ? videoRef0.current : videoRef1.current;
          if (video) {
            video.src = videos[nextIdx];
            video.load();
            video.play().catch(() => {});
          }
        }, 1200);
        return 1 - prev;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('¡Gracias! Te enviaremos información pronto');
    setEmail('');
  };

  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <img src="/logos/logo.png" alt="HABITACLICK" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
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
      <section className="hero">
        <video
          ref={videoRef0}
          src={videos[0]}
          className="hero-video"
          style={{ opacity: activeSlot === 0 ? 1 : 0 }}
          autoPlay muted loop playsInline
        />
        <video
          ref={videoRef1}
          src={videos[1]}
          className="hero-video"
          style={{ opacity: activeSlot === 1 ? 1 : 0 }}
          autoPlay muted loop playsInline
        />
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1>Software inmobiliario para publicar en TODOS los portales a la vez</h1>
          <p>Sincroniza tus propiedades automáticamente en Idealista, Fotocasa y más portales inmobiliarios. Gestiona toda tu cartera desde una sola plataforma y ahorra horas cada semana.</p>
          <button className="btn-primary btn-large" onClick={onSignupClick}>Comienza tu prueba gratuita</button>
          <p className="hero-subtext">✅ 14 días gratis • Sin tarjeta de crédito • Cancela en cualquier momento</p>
        </div>
      </section>

      {/* Problema/Solución */}
      <section className="problem-solution">
        <h2>El problema de las agencias inmobiliarias hoy</h2>
        <div className="cards-grid">
          <div className="card-problem">
            <div className="icon">⏱️</div>
            <h3>Horas perdidas publicando manualmente</h3>
            <p>Subir cada propiedad a Idealista, Fotocasa y otros portales por separado consume horas cada semana</p>
          </div>
          <div className="card-problem">
            <div className="icon">💰</div>
            <h3>Costes elevados por portal</h3>
            <p>Pagar suscripciones independientes a cada portal inmobiliario dispara los gastos fijos de tu agencia</p>
          </div>
          <div className="card-problem">
            <div className="icon">😰</div>
            <h3>Datos desincronizados entre portales</h3>
            <p>Precios y disponibilidad diferentes en cada portal generan confusión y pérdida de clientes</p>
          </div>
        </div>

        <h2 style={{ marginTop: '60px' }}>La solución: HabitaClick</h2>
        <div className="solution-list">
          <div className="solution-item">
            <div className="check">✅</div>
            <div>
              <h4>Publica en todos los portales con un solo clic</h4>
              <p>Sube tu propiedad una vez y HabitaClick la sincroniza automáticamente en todos los portales inmobiliarios</p>
            </div>
          </div>
          <div className="solution-item">
            <div className="check">✅</div>
            <div>
              <h4>Reduce costes hasta un 90%</h4>
              <p>Un único pago mensual desde 18,99€ en lugar de múltiples suscripciones a portales</p>
            </div>
          </div>
          <div className="solution-item">
            <div className="check">✅</div>
            <div>
              <h4>Propiedades siempre actualizadas en tiempo real</h4>
              <p>Cualquier cambio de precio o estado se actualiza al instante en todos los portales</p>
            </div>
          </div>
          <div className="solution-item">
            <div className="check">✅</div>
            <div>
              <h4>CRM inmobiliario integrado</h4>
              <p>Gestiona toda tu cartera de propiedades y agentes desde un único dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portales soportados */}
      <section className="portals">
        <h2>Integrado con los principales portales inmobiliarios</h2>
        <div className="portals-grid">
          <div className="portal-logo">Idealista</div>
          <div className="portal-logo">Fotocasa</div>
          <div className="portal-logo">Oportuna</div>
          <div className="portal-logo">Inmuebles24</div>
          <div className="portal-logo">Vivanuncios</div>
        </div>
        <p className="portals-note">Y muchos más. Nos integramos continuamente con nuevos portales inmobiliarios en España.</p>
      </section>

      {/* Planes */}
      <section className="pricing">
        <h2>Planes simples y transparentes</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Starter</h3>
            <div className="price">€18,99<span>/mes</span></div>
            <p className="description">Para agencias pequeñas</p>
            <ul>
              <li>✅ Hasta 50 propiedades</li>
              <li>✅ 4 portales incluidos</li>
              <li>✅ Sincronización automática</li>
              <li>✅ Soporte email</li>
            </ul>
            <button className="btn-secondary" onClick={onSignupClick}>Comenzar</button>
          </div>

          <div className="pricing-card featured">
            <div className="badge">MÁS POPULAR</div>
            <h3>Professional</h3>
            <div className="price">€39,99<span>/mes</span></div>
            <p className="description">Para agencias medianas</p>
            <ul>
              <li>✅ Hasta 500 propiedades</li>
              <li>✅ 8 portales incluidos</li>
              <li>✅ Sincronización bidireccional</li>
              <li>✅ Soporte prioritario</li>
              <li>✅ Analytics avanzado</li>
            </ul>
            <button className="btn-primary" onClick={onSignupClick}>Comenzar prueba gratis</button>
          </div>

          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Personalizado</div>
            <p className="description">Para grandes agencias</p>
            <ul>
              <li>✅ Propiedades ilimitadas</li>
              <li>✅ Todos los portales</li>
              <li>✅ Integraciones custom</li>
              <li>✅ Soporte 24/7</li>
              <li>✅ Dedicado account manager</li>
            </ul>
            <button className="btn-secondary" onClick={() => alert('Contacta con ventas')}>Contactar ventas</button>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="final-cta">
        <h2>¿Listo para transformar tu agencia inmobiliaria?</h2>
        <p>Únete a las agencias inmobiliarias que ya publican en todos los portales automáticamente con HabitaClick. Sin complicaciones, sin costes extra.</p>
        <button className="btn-primary btn-large" onClick={onSignupClick}>Empieza gratis 14 días</button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>HABITACLICK</h4>
            <p>La plataforma de sincronización inteligente para inmobiliarias modernas</p>
          </div>
          <div className="footer-section">
            <h4>Producto</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Precios</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Empresa</h4>
            <ul>
              <li><a href="#about">Sobre nosotros</a></li>
              <li><a href="#contact">Contacto</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); onPolicyPrivacyClick(); }} style={{ cursor: 'pointer' }}>
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); onPolicyCookiesClick(); }} style={{ cursor: 'pointer' }}>
                  Política de Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 HABITACLICK. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;