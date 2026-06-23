import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

export default function CookieConsent({ onPolicyCookiesClick, onPolicyPrivacyClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
    personalization: false,
  });

  // Cargar preferencias guardadas al montar
  useEffect(() => {
    const savedConsent = localStorage.getItem('habitaclick-cookie-consent');
    if (!savedConsent) {
      setIsVisible(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed.preferences || preferences);
      } catch (e) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      accepted: true,
      date: new Date().toISOString(),
      preferences: {
        analytics: true,
        marketing: true,
        personalization: true,
      },
    };
    localStorage.setItem('habitaclick-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    loadAnalytics();
  };

  const handleRejectAll = () => {
    const consent = {
      accepted: false,
      date: new Date().toISOString(),
      preferences: {
        analytics: false,
        marketing: false,
        personalization: false,
      },
    };
    localStorage.setItem('habitaclick-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      accepted: true,
      date: new Date().toISOString(),
      preferences: preferences,
    };
    localStorage.setItem('habitaclick-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const loadAnalytics = () => {
    // Aquí cargarías Google Analytics, Hotjar, etc.
    console.log('Analytics loaded');
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-overlay">
      <div className="cookie-modal">
        
        {/* Logo en lugar de texto */}
        <div className="cookie-logo-container">
          <img src="/logos/logo.png" alt="habitaclick" className="cookie-logo" />
        </div>

        {!showSettings ? (
          <>
            <p className="cookie-text">
              Utilizamos cookies y tecnologías similares propias y de terceros para almacenar, acceder y tratar datos personales como identificadores únicos, direcciones IP y datos de navegación. De conformidad con la ley, algunos datos se procesan en base a interés legítimo.
            </p>

            <p className="cookie-text">
              Puedes administrar tu selección, retirar tu consentimiento u oponerte al interés legítimo en cualquier momento haciendo click en "Configurar". También puedes encontrar más información en nuestra{' '}
              <button 
                onClick={onPolicyCookiesClick}
                className="cookie-link"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2ECC71',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  font: 'inherit'
                }}
              >
                Política de Cookies
              </button>
              {' '}y{' '}
              <button 
                onClick={onPolicyPrivacyClick}
                className="cookie-link"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2ECC71',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  font: 'inherit'
                }}
              >
                Política de Privacidad
              </button>
              .
            </p>

            <div className="data-treatment">
              <p className="treatment-title">
                Nosotros hacemos el siguiente tratamiento de datos:
              </p>
              <ul className="treatment-list">
                <li>Almacenar la información en un dispositivo y/o acceder a ella</li>
                <li>Análisis y comunicación de datos a empresas de nuestro grupo</li>
                <li>Publicidad y contenido personalizados, medición de publicidad y contenido</li>
                <li>Desarrollo de servicios e investigación de audiencia</li>
              </ul>
            </div>

            <div className="cookie-buttons">
              <button
                onClick={() => setShowSettings(true)}
                className="btn btn-configure"
              >
                Configurar
              </button>

              <button
                onClick={handleRejectAll}
                className="btn btn-secondary"
              >
                Rechazar
              </button>

              <button
                onClick={handleAcceptAll}
                className="btn btn-primary"
              >
                Aceptar y continuar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="cookie-text">
              Personaliza tus preferencias de cookies:
            </p>

            <div className="data-treatment">
              <div className="preference-item">
                <div>
                  <p className="preference-title">Análisis</p>
                  <p className="preference-desc">
                    Para entender cómo usas nuestro sitio
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => handlePreferenceChange('analytics')}
                  className="preference-checkbox"
                />
              </div>

              <div className="preference-item">
                <div>
                  <p className="preference-title">Marketing</p>
                  <p className="preference-desc">
                    Para mostrarte anuncios relevantes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => handlePreferenceChange('marketing')}
                  className="preference-checkbox"
                />
              </div>

              <div className="preference-item">
                <div>
                  <p className="preference-title">Personalización</p>
                  <p className="preference-desc">
                    Para personalizar tu experiencia
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.personalization}
                  onChange={() => handlePreferenceChange('personalization')}
                  className="preference-checkbox"
                />
              </div>
            </div>

            <div className="cookie-buttons">
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-secondary"
              >
                Atrás
              </button>

              <button
                onClick={handleSavePreferences}
                className="btn btn-primary"
              >
                Guardar preferencias
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}