??import React, { useState, useEffect } from 'react';
import CookieConsent from './components/CookieConsent';
import PropertyEditor from './components/PropertyEditor';
import UserManager from './components/UserManager';
import UserSearchInput from './components/UserSearchInput';
import Landing from './Landing';
import Signup from './Signup';
import Login from './Login';
import PoliticaCookies from './components/PoliticaCookies';
import PoliticaPrivacidad from './components/PoliticaPrivacidad';
import './App.css';

function App() {
  const [view, setView] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('asesor');
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [search, setSearch] = useState('');
  const [dashView, setDashView] = useState('properties');
  const [teamUsers, setTeamUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    address: '',
    city: '',
    province: '',
    property_type: 'apartment',
    transaction_type: 'sale',
    bedrooms: '',
    bathrooms: '',
    square_meters: '',
    description: '',
    assigned_to: ''
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
  }, []);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api/v1/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          title: formData.title,
          price: parseFloat(formData.price),
          address: formData.address,
          city: formData.city,
          province: formData.province,
          property_type: formData.property_type,
          transaction_type: formData.transaction_type,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
          square_meters: formData.square_meters ? parseFloat(formData.square_meters) : null,
          description: formData.description || null,
          assigned_to: formData.assigned_to || null
        })
      });

      if (res.ok) {
        const data = await res.json();
        const propertyId = data.property.id;

        const allFiles = [...selectedPhotos, ...selectedVideos];
        if (allFiles.length > 0) {
          const mediaFormData = new FormData();
          allFiles.forEach(file => mediaFormData.append('files', file));
          await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/properties/${propertyId}/photos`, {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + token },
            body: mediaFormData
          });
        }

        setFormData({
          title: '', price: '', address: '', city: '', province: '',
          property_type: 'apartment', transaction_type: 'sale',
          bedrooms: '', bathrooms: '', square_meters: '', description: '', assigned_to: ''
        });
        setSelectedPhotos([]);
        setSelectedVideos([]);
        setShowForm(false);
        showToast('success', 'Propiedad creada correctamente');
        loadProperties();
      } else {
        showToast('error', 'Error al crear la propiedad');
      }
    } catch (err) {
      showToast('error', 'Error: ' + err.message);
    }
  };

  const deleteProperty = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api/v1/properties/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      });
      setConfirmDeleteId(null);
      showToast('success', 'Propiedad eliminada');
      loadProperties();
    } catch (err) {
      showToast('error', 'Error al eliminar');
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

  const typeLabels = { apartment: 'Apartamento', house: 'Casa', land: 'Terreno', commercial: 'Comercial' };

  const ROLE_LEVEL = { asesor: 1, director: 2, administrador: 3 };
  const can = (...roles) => roles.some(r => ROLE_LEVEL[userRole] >= ROLE_LEVEL[r]);

  const ROLE_LABELS = { asesor: 'Asesor', director: 'Director', administrador: 'Administrador' };
  const ROLE_COLORS = { asesor: '#6b7280', director: '#2563eb', administrador: '#7c3aed' };

  const filteredProperties = properties.filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.address?.toLowerCase().includes(search.toLowerCase()) ||
    p.reference?.toLowerCase().includes(search.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Referencia', 'T�tulo', 'Tipo', 'Operaci�n', 'Precio (�)', 'Direcci�n', 'Ciudad', 'Provincia', 'Habitaciones', 'Ba�os', 'm�', 'Descripci�n', 'Asesor', 'Fotos', 'Fecha'];
    const rows = filteredProperties.map(p => {
      const asesor = p.assigned_user
        ? (p.assigned_user.nombre && p.assigned_user.apellidos
            ? `${p.assigned_user.nombre} ${p.assigned_user.apellidos}`
            : p.assigned_user.email)
        : '';
      return [
        p.reference || '-',
        p.title || '',
        typeLabels[p.property_type] || p.property_type || '',
        p.transaction_type === 'sale' ? 'Venta' : 'Alquiler',
        p.price || '',
        p.address || '',
        p.city || '',
        p.province || '',
        p.bedrooms || '',
        p.bathrooms || '',
        p.square_meters || '',
        (p.description || '').replace(/"/g, '""'),
        asesor,
        p.photos?.length || 0,
        p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES') : ''
      ];
    });
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(';'))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitaclick-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
                <button className="btn-logout" onClick={handleLogout}>Cerrar sesi�n</button>
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
            </nav>
          )}

          <main className="container">
            {dashView === 'properties' && (<>
            <div className="controls">
              <div className="controls-left">
                <h2>Propiedades ({filteredProperties.length}{search ? ` de ${properties.length}` : ''})</h2>
                {properties.length > 0 && (
                  <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                      className="search-input"
                      type="text"
                      placeholder="Buscar por título, ciudad…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                      <button className="search-clear" onClick={() => setSearch('')}>✕</button>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {properties.length > 0 && (
                  <button className="btn-export" onClick={exportToCSV}>⬇ CSV</button>
                )}
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                  {showForm ? 'Cancelar' : '+ Nueva Propiedad'}
                </button>
              </div>
            </div>

            {showForm && (
              <div className="form-container">
                <h3>Crear Nueva Propiedad</h3>
                <div className="form-row">
                  <input type="text" name="title" placeholder="Título *" value={formData.title} onChange={handleChange} required />
                  <input type="number" name="price" placeholder="Precio (€) *" value={formData.price} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <input type="text" name="address" placeholder="Dirección *" value={formData.address} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <input type="text" name="city" placeholder="Ciudad *" value={formData.city} onChange={handleChange} required />
                  <input type="text" name="province" placeholder="Provincia *" value={formData.province} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <select name="property_type" value={formData.property_type} onChange={handleChange}>
                    <option value="apartment">Apartamento</option>
                    <option value="house">Casa</option>
                    <option value="land">Terreno</option>
                    <option value="commercial">Comercial</option>
                  </select>
                  <select name="transaction_type" value={formData.transaction_type} onChange={handleChange}>
                    <option value="sale">Venta</option>
                    <option value="rent">Alquiler</option>
                  </select>
                </div>
                <div className="form-row">
                  <input type="number" name="bedrooms" placeholder="Habitaciones" value={formData.bedrooms} onChange={handleChange} />
                  <input type="number" name="bathrooms" placeholder="Baños" value={formData.bathrooms} onChange={handleChange} />
                  <input type="number" name="square_meters" placeholder="m²" value={formData.square_meters} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <textarea
                    name="description"
                    placeholder="Descripción del inmueble..."
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    rows={4}
                  />
                </div>

                {/* Asignación de asesor */}
                <div className="assign-row">
                  <div className="assign-label">Asesor responsable</div>
                  <div className="assign-controls">
                    <button
                      type="button"
                      className={`btn-assign-me${formData.assigned_to === getCurrentUserId() ? ' active' : ''}`}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        assigned_to: prev.assigned_to === getCurrentUserId() ? '' : getCurrentUserId()
                      }))}
                    >
                      {formData.assigned_to === getCurrentUserId() ? '✓ Asignado a mí' : '👤 Asignarme'}
                    </button>
                    <UserSearchInput
                      users={teamUsers.filter(u => u.id !== getCurrentUserId())}
                      value={formData.assigned_to !== getCurrentUserId() ? formData.assigned_to : ''}
                      onChange={id => setFormData(prev => ({ ...prev, assigned_to: id }))}
                      placeholder="Buscar compañero…"
                    />
                  </div>
                </div>

                <div className="form-row upload-row">
                  <div className="upload-field">
                    <label className="upload-label" htmlFor="upload-photos">
                      📷 {selectedPhotos.length > 0 ? `${selectedPhotos.length} foto(s) seleccionada(s)` : 'Añadir fotografías'}
                    </label>
                    <input
                      id="upload-photos"
                      type="file"
                      multiple
                      accept="image/*"
                      className="upload-input"
                      onChange={e => setSelectedPhotos(Array.from(e.target.files))}
                    />
                    {selectedPhotos.length > 0 && (
                      <div className="upload-previews">
                        {selectedPhotos.map((f, i) => (
                          <img key={i} src={URL.createObjectURL(f)} alt={f.name} className="upload-preview-thumb" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="upload-field">
                    <label className="upload-label" htmlFor="upload-videos">
                      🎬 {selectedVideos.length > 0 ? `${selectedVideos.length} vídeo(s) seleccionado(s)` : 'Añadir vídeos (opcional)'}
                    </label>
                    <input
                      id="upload-videos"
                      type="file"
                      multiple
                      accept="video/*"
                      className="upload-input"
                      onChange={e => setSelectedVideos(Array.from(e.target.files))}
                    />
                    {selectedVideos.length > 0 && (
                      <ul className="upload-file-list">
                        {selectedVideos.map((f, i) => <li key={i}>🎬 {f.name}</li>)}
                      </ul>
                    )}
                  </div>
                </div>

                <button type="button" className="btn-primary" onClick={handleSubmit}>Crear Propiedad</button>
              </div>
            )}

            <div className="property-list">
              {loadingProperties ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="property-row-skeleton" />
                ))
              ) : filteredProperties.length === 0 ? (
                <div className="empty">
                  {search
                    ? `Sin resultados para "${search}"`
                    : 'No hay propiedades. Crea una para empezar.'}
                </div>
              ) : (
                filteredProperties.map(p => {
                  const primaryPhoto = p.photos?.find(ph => ph.is_primary && ph.media_type === 'photo')
                    || p.photos?.find(ph => ph.media_type === 'photo');
                  const isConfirming = confirmDeleteId === p.id;
                  return (
                    <div key={p.id} className={`property-row${isConfirming ? ' property-row--confirming' : ''}`}>
                      <div className="property-row-photo">
                        {primaryPhoto ? (
                          <img src={`http://localhost:3001${primaryPhoto.url}`} alt={p.title} />
                        ) : (
                          <div className="property-row-photo-placeholder">📷</div>
                        )}
                      </div>

                      <div className="property-row-info">
                        <div className="property-row-title">
                          {p.reference && <span className="ref-badge">{p.reference}</span>}
                          {p.title}
                        </div>
                        <div className="property-row-location">📍 {p.address}, {p.city} ({p.province})</div>
                        {p.description && (
                          <div className="property-row-desc">
                            {p.description.length > 80 ? p.description.slice(0, 80) + '…' : p.description}
                          </div>
                        )}
                        {p.assigned_user && (
                          <div className="property-row-asesor">
                            <span
                              className="asesor-dot"
                              style={{ background: ROLE_COLORS[p.assigned_user.role] || '#6b7280' }}
                            />
                            {p.assigned_user.nombre && p.assigned_user.apellidos
                              ? `${p.assigned_user.nombre} ${p.assigned_user.apellidos}`
                              : p.assigned_user.email}
                            {p.assigned_user.cargo && <span className="asesor-cargo"> · {p.assigned_user.cargo}</span>}
                          </div>
                        )}
                        <div className="property-row-meta">
                          <span className="tag-light tag-type">{typeLabels[p.property_type] || p.property_type}</span>
                          <span className={`tag-light tag-tx ${p.transaction_type}`}>{p.transaction_type === 'sale' ? 'Venta' : 'Alquiler'}</span>
                          {p.bedrooms && <span className="tag-light">🛏 {p.bedrooms}</span>}
                          {p.bathrooms && <span className="tag-light">🚿 {p.bathrooms}</span>}
                          {p.square_meters && <span className="tag-light">📐 {p.square_meters} m²</span>}
                        </div>
                      </div>

                      <div className="property-row-price">
                        <span>{p.price?.toLocaleString('es-ES')} €</span>
                        {p.photos?.length > 0 && (
                          <span className="property-row-photos-count">📷 {p.photos.length}</span>
                        )}
                      </div>

                      <div className="property-row-actions">
                        {isConfirming ? (
                          <div className="confirm-inline">
                            <span className="confirm-inline-text">¿Eliminar?</span>
                            <button className="confirm-yes" onClick={() => deleteProperty(p.id)}>Sí</button>
                            <button className="confirm-no" onClick={() => setConfirmDeleteId(null)}>No</button>
                          </div>
                        ) : (
                          <>
                            <button className="btn-edit" onClick={() => setEditingProperty(p)}>✏️ Editar</button>
                            <button className="btn-delete" onClick={() => setConfirmDeleteId(p.id)}>✕ Eliminar</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            </>)}

            {dashView === 'users' && can('director') && (
              <UserManager currentUserRole={userRole} onToast={showToast} />
            )}
          </main>
        </div>

        {editingProperty && (
          <PropertyEditor
            property={editingProperty}
            teamUsers={teamUsers}
            currentUserId={getCurrentUserId()}
            onClose={() => setEditingProperty(null)}
            onSaved={() => {
              setEditingProperty(null);
              loadProperties();
              showToast('success', 'Cambios guardados correctamente');
            }}
          />
        )}
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
      />
    </div>
  );
}

export default App;

