import React, { useState, useEffect } from 'react';
import CookieConsent from './components/CookieConsent';
import UserManager from './components/UserManager';
import PropertyManager from './components/PropertyManager';
import Landing from './Landing';
import Signup from './Signup';
import Login from './Login';
import PoliticaCookies from './components/PoliticaCookies';
import PoliticaPrivacidad from './components/PoliticaPrivacidad';
import SobreNosotros from './components/SobreNosotros';
import Contacto from './components/Contacto';
import WebsiteBuilder from './components/WebsiteBuilder';
import WebsitePublic from './components/WebsitePublic';
import './App.css';

function App() {
  const [view, setView] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('asesor');
  const [properties, setProperties] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [toast, setToast] = useState(null);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [dashView, setDashView] = useState('properties');
  const [teamUsers, setTeamUsers] = useState([]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const getPayloadFromToken = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return {}; }
  };

  const getRoleFromToken = (token) => getPayloadFromToken(token).role || 'asesor';

  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    return token ? getPayloadFromToken(token).id || '' : '';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setUserRole(getRoleFromToken(token));
    }
    fetch((process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/ping').catch(() => {});
  }, []);

  // Route /sitio/:slug → public website
  const sitioMatch = window.location.pathname.match(/^\/sitio\/([^/]+)/);
  if (sitioMatch) {
    return <WebsitePublic slug={sitioMatch[1]} />;
  }

  useEffect(() => {
    if (isLoggedIn) {
      loadProperties();
      loadTeamUsers();
    }
  }, [isLoggedIn]);

  const loadTeamUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api/v1/users/simple', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      setTeamUsers(data.users || []);
    } catch {}
  };

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api/v1/properties', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (e) {
      console.error(e);
      showToast('error', 'Error al cargar propiedades');
    } finally {
      setLoadingProperties(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setView('landing');
  };

  const navigateWithAnimation = (newView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setIsTransitioning(false);
    }, 250);
  };

  const contentStyle = {
    opacity: isTransitioning ? 0 : 1,
    filter: isTransitioning ? 'blur(8px)' : 'blur(0px)',
    transition: 'opacity 0.25s ease-in-out, filter 0.25s ease-in-out',
  };

  const ROLE_LEVEL = { asesor: 1, director: 2, administrador: 3 };
  const can = (...roles) => roles.some(r => ROLE_LEVEL[userRole] >= ROLE_LEVEL[r]);

  const ROLE_LABELS = { asesor: 'Asesor', director: 'Director', administrador: 'Administrador' };
  const ROLE_COLORS = { asesor: '#6b7280', director: '#2563eb', administrador: '#7c3aed' };

  // VISTA: DASHBOARD
  if (isLoggedIn) {
    return (
      <div className="App dashboard-container" style={contentStyle}>
        <video className="dashboard-video" autoPlay muted loop playsInline>
          <source src="/videos/VideoLandingMadrid.mp4" type="video/mp4" />
        </video>
        <div className="dashboard-overlay" />

        {/* Toast */}
        {toast && (
          <div className={`toast toast--${toast.type}`}>
            <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
            {toast.msg}
          </div>
        )}

        <div className="dashboard-content">
          <header className="header">
            <div className="header-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src="/logos/logo.png" alt="HABITACLICK" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
                <div>
                  <h1 style={{ margin: 0 }}>Dashboard</h1>
                  <p>Gestiona tus propiedades</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="role-badge" style={{ background: ROLE_COLORS[userRole] }}>
                  {ROLE_LABELS[userRole]}
                </span>
                <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
              </div>
            </div>
          </header>

          {can('director') && (
            <nav className="dash-tabs">
              <button
                className={`dash-tab${dashView === 'properties' ? ' active' : ''}`}
                onClick={() => setDashView('properties')}
              >
                🏠 Propiedades
              </button>
              <button
                className={`dash-tab${dashView === 'users' ? ' active' : ''}`}
                onClick={() => setDashView('users')}
              >
                👥 Equipo
              </button>
              <button
                className={`dash-tab${dashView === 'website' ? ' active' : ''}`}
                onClick={() => setDashView('website')}
              >
                🌐 Página Web
              </button>
            </nav>
          )}

          {dashView === 'properties' && (
            <PropertyManager
              properties={properties}
              loadProperties={loadProperties}
              showToast={showToast}
              teamUsers={teamUsers}
              getCurrentUserId={getCurrentUserId}
              userRole={userRole}
            />
          )}

          {(dashView === 'users' || dashView === 'website') && (
            <main className="container">
              {dashView === 'users' && can('director') && (
                <UserManager currentUserRole={userRole} onToast={showToast} />
              )}
              {dashView === 'website' && can('director') && (
                <WebsiteBuilder currentUserRole={userRole} onToast={showToast} properties={properties} />
              )}
            </main>
          )}
        </div>

      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div style={contentStyle}>
        <Signup
          onSignupSuccess={() => setIsLoggedIn(true)}
          onBackToLanding={() => navigateWithAnimation('landing')}
        />
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div style={contentStyle}>
        <Login
          onLoginSuccess={() => {
            const token = localStorage.getItem('token');
            setUserRole(getRoleFromToken(token));
            setIsLoggedIn(true);
          }}
          onBackToLanding={() => navigateWithAnimation('landing')}
        />
      </div>
    );
  }

  if (view === 'sobre') {
    return (
      <div style={contentStyle}>
        <SobreNosotros onBack={() => navigateWithAnimation('landing')} />
      </div>
    );
  }

  if (view === 'contacto') {
    return (
      <div style={contentStyle}>
        <Contacto onBack={() => navigateWithAnimation('landing')} />
      </div>
    );
  }

  if (view === 'politica-cookies') {
    return (
      <div style={contentStyle}>
        <PoliticaCookies />
        <button onClick={() => navigateWithAnimation('landing')} style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 10000, padding: '10px 20px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          ← Volver
        </button>
      </div>
    );
  }

  if (view === 'politica-privacidad') {
    return (
      <div style={contentStyle}>
        <PoliticaPrivacidad />
        <button onClick={() => navigateWithAnimation('landing')} style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 10000, padding: '10px 20px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div style={contentStyle}>
      <CookieConsent
        onPolicyCookiesClick={() => navigateWithAnimation('politica-cookies')}
        onPolicyPrivacyClick={() => navigateWithAnimation('politica-privacidad')}
      />
      <Landing
        onSignupClick={() => navigateWithAnimation('signup')}
        onLoginClick={() => navigateWithAnimation('login')}
        onPolicyCookiesClick={() => navigateWithAnimation('politica-cookies')}
        onPolicyPrivacyClick={() => navigateWithAnimation('politica-privacidad')}
        onSobreClick={() => navigateWithAnimation('sobre')}
        onContactoClick={() => navigateWithAnimation('contacto')}
      />
    </div>
  );
}

export default App;

