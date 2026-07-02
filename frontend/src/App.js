import React, { useState, useEffect } from 'react';
import { Home, Users, Globe, Check, X, LogOut, Share2, Settings, Upload, Trash2 } from 'lucide-react';
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
import PortalSettings from './components/PortalSettings';
import './App.css';


const DASH_SECTIONS = ['properties', 'users', 'website', 'portales'];
const VIEW_PATHS = {
  landing: '/', login: '/login', signup: '/registro',
  sobre: '/sobre-nosotros', contacto: '/contacto',
  'politica-cookies': '/politica-cookies', 'politica-privacidad': '/politica-privacidad',
};
const PATH_VIEWS = Object.fromEntries(Object.entries(VIEW_PATHS).map(([k, v]) => [v, k]));

function parsePath() {
  const path = window.location.pathname;
  const m = path.match(/^\/dashboard\/?(.*)$/);
  if (m) {
    const sec = m[1].replace(/\/$/, '') || 'properties';
    return { view: 'dashboard', dashView: DASH_SECTIONS.includes(sec) ? sec : 'properties' };
  }
  return { view: PATH_VIEWS[path] || 'landing', dashView: 'properties' };
}

function App() {
  const parsed = parsePath();
  const [view, setView] = useState(parsed.view);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState('asesor');
  const [properties, setProperties] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [toast, setToast] = useState(null);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [dashView, setDashView] = useState(parsed.dashView);
  const [teamUsers, setTeamUsers] = useState([]);
  const [showAgencyConfig, setShowAgencyConfig] = useState(false);
  const [agencyConfig, setAgencyConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agencyConfig') || '{}'); } catch { return {}; }
  });

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

  useEffect(() => {
    const onPop = () => {
      const p = parsePath();
      if (p.view === 'dashboard') {
        setDashView(p.dashView);
      } else {
        setView(p.view);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
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


  const updateAgencyConfig = (key, value) => {
    setAgencyConfig(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('agencyConfig', JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setView('landing');
    window.history.pushState(null, '', '/');
  };

  const navigateDash = (section) => {
    setDashView(section);
    const url = section === 'properties' ? '/dashboard' : `/dashboard/${section}`;
    window.history.pushState(null, '', url);
  };

  const navigateWithAnimation = (newView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setIsTransitioning(false);
      window.history.pushState(null, '', VIEW_PATHS[newView] || '/');
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
    const userInitial = ROLE_LABELS[userRole]?.charAt(0) || '?';
    return (
      <div className="App dash-root" style={contentStyle}>

        {/* Toast */}
        {toast && (
          <div className={`toast toast--${toast.type}`}>
            <span className="toast-icon">{toast.type === 'success' ? <Check size={14}/> : <X size={14}/>}</span>
            {toast.msg}
          </div>
        )}

        <div className="dash-layout">

          {/* ── Sidebar vertical ── */}
          <aside className="dash-sidebar">


            <nav className="dash-sidebar-nav">
              <button
                className={`dash-sitem${dashView === 'properties' ? ' active' : ''}`}
                onClick={() => navigateDash('properties')}
              >
                <Home size={21}/>
                <span className="dash-tooltip">Inmuebles</span>
              </button>

              {can('director') && (
                <button
                  className={`dash-sitem${dashView === 'users' ? ' active' : ''}`}
                  onClick={() => navigateDash('users')}
                >
                  <Users size={21}/>
                  <span className="dash-tooltip">Equipo</span>
                </button>
              )}

              {can('director') && (
                <button
                  className={`dash-sitem${dashView === 'website' ? ' active' : ''}`}
                  onClick={() => navigateDash('website')}
                >
                  <Globe size={21}/>
                  <span className="dash-tooltip">Página Web</span>
                </button>
              )}

              {can('director') && (
                <button
                  className={`dash-sitem${dashView === 'portales' ? ' active' : ''}`}
                  onClick={() => navigateDash('portales')}
                >
                  <Share2 size={21}/>
                  <span className="dash-tooltip">Portales</span>
                </button>
              )}
            </nav>

            <div className="dash-sidebar-bottom">
              <div
                className="dash-user-avatar"
                style={{ background: ROLE_COLORS[userRole] }}
                title={ROLE_LABELS[userRole]}
              >
                {userInitial}
              </div>
              <button
                className={`dash-logout-btn${showAgencyConfig ? ' active' : ''}`}
                onClick={() => setShowAgencyConfig(v => !v)}
                title="Configuración"
              >
                <Settings size={17}/>
                <span className="dash-tooltip">Configuración</span>
              </button>
              <button className="dash-logout-btn" onClick={handleLogout}>
                <LogOut size={17}/>
                <span className="dash-tooltip">Cerrar sesión</span>
              </button>
            </div>

            {/* ── Panel configuración inmobiliaria ── */}
            {showAgencyConfig && (
              <div className="dash-agency-panel">
                <div className="dap-header">
                  <span>Configuración</span>
                  <button className="dap-close" onClick={() => setShowAgencyConfig(false)}><X size={14}/></button>
                </div>
                <div className="dap-body">
                  <label className="dap-label">Nombre de la inmobiliaria</label>
                  <input
                    className="dap-input"
                    type="text"
                    placeholder="Ej: Inmobiliaria García"
                    value={agencyConfig.name || ''}
                    onChange={e => updateAgencyConfig('name', e.target.value)}
                  />
                  <label className="dap-label" style={{ marginTop: 14 }}>Logo</label>
                  {agencyConfig.logo ? (
                    <div className="dap-logo-preview">
                      <img src={agencyConfig.logo} alt="Logo" />
                      <button className="dap-logo-del" onClick={() => updateAgencyConfig('logo', null)}>
                        <Trash2 size={13}/> Eliminar
                      </button>
                    </div>
                  ) : (
                    <label className="dap-upload">
                      <Upload size={15}/> Subir logo
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => updateAgencyConfig('logo', ev.target.result);
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  )}
                  <p className="dap-hint">Estos datos se usarán en los PDFs de simulación hipotecaria.</p>
                </div>
              </div>
            )}
          </aside>

          {/* ── Contenido principal ── */}
          <div className="dash-content">
            {dashView === 'properties' && (
              <PropertyManager
                properties={properties}
                loadProperties={loadProperties}
                showToast={showToast}
                teamUsers={teamUsers}
                getCurrentUserId={getCurrentUserId}
                userRole={userRole}
                agencyConfig={agencyConfig}
              />
            )}
            {dashView === 'users' && can('director') && (
              <div className="dash-scrollable">
                <main className="container">
                  <UserManager currentUserRole={userRole} onToast={showToast} />
                </main>
              </div>
            )}
            {dashView === 'website' && can('director') && (
              <WebsiteBuilder currentUserRole={userRole} onToast={showToast} properties={properties} />
            )}
            {dashView === 'portales' && can('director') && (
              <div className="dash-scrollable">
                <PortalSettings showToast={showToast} />
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div style={contentStyle}>
        <Signup
          onSignupSuccess={() => { setIsLoggedIn(true); window.history.pushState(null, '', '/dashboard'); }}
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
            window.history.pushState(null, '', '/dashboard');
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

