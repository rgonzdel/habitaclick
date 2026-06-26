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
          <h1>Una sola plataforma para publicar en TODOS los portales</h1>
          <p>Sincroniza tus propiedades automáticamente en Idealista, Fotocasa y más. Ahorra tiempo y dinero.</p>
          <button className="btn-primary btn-large" onClick={onSignupClick}>Comienza tu prueba gratuita</button>
          <p className="hero-subtext">✅ 14 días gratis • Sin tarjeta de crédito • Cancela en cualquier momento</p>
        </div>
      </section>

      {/* Problema/Solución */}
      <section className="problem-solution">
        <h2>El problema de las inmobiliarias hoy</h2>
        <div className="cards-grid">
          <div className="card-problem">
            <div className="icon">⏱️</div>
            <h3>Perder horas publicando</h3>
            <p>Publicar en 5+ portales manualmente toma horas cada semana</p>
          </div>
          <div className="card-problem">
            <div className="icon">💰</div>
            <h3>Comisiones altas</h3>
            <p>Gastar €50-200 por propiedad en comisiones de portales</p>
          </div>
          <div className="card-problem">
            <div className="icon">😰</div>
            <h3>Errores y desincronización</h3>
            <p>Datos inconsistentes entre portales causan confusión</p>
          </div>
        </div>

        <h2 style={{ marginTop: '60px' }}>Nuestra solución</h2>
        <div className="solution-list">
          <div className="solution-item">
            <div className="check">✅</div>
            <div>
              <h4>Publica una sola vez</h4>
              <p>Sube tu propiedad y se sincroniza automáticamente a todos los portales</p>
            </div>
          </div>
          <div className="solution-item">
            <div className="check">✅</div>
            <div>
              <h4>Ahorra hasta 90% en comisiones</h4>
              <p>Un único pago mensual en lugar de múltiples comisiones</p>
            </div>
          </div>
          <div className="solution-item">
            <div className="check">✅</div>
            <div>
              <h4>Datos siempre sincronizados</h4>
              <p>Todos tus portales actualizados en tiempo real</p>
            </div>
          </div>
          <div className="solution-item">
            <div className="check">✅</div>
            <div>
              <h4>Gestiona todo desde un lugar</h4>
              <p>Dashboard único para todas tus propiedades y portales</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portales soportados */}
      <section className="portals">
        <h2>Sincroniza con los principales portales</h2>
        <div className="portals-grid">
          <div className="portal-logo">Idealista</div>
          <div className="portal-logo">Fotocasa</div>
          <div className="portal-logo">Oportuna</div>
          <div className="portal-logo">Inmuebles24</div>
          <div className="portal-logo">Vivanuncios</div>
        </div>
        <p className="portals-note">Y muchos más. Nos integramos continuamente con nuevos portales.</p>
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
        <h2>¿Listo para revolucionar tu negocio inmobiliario?</h2>
        <p>Únete a cientos de agencias que ya ahorran tiempo y dinero con HABITACLICK</p>
        <button className="btn-primary btn-large" onClick={onSignupClick}>Comienza gratis hoy</button>
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