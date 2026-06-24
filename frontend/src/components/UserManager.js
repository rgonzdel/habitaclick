??import React, { useState, useEffect } from 'react';
import './UserManager.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const ROLE_LABELS = { asesor: 'Asesor', director: 'Director', administrador: 'Administrador' };
const ROLE_COLORS = { asesor: '#6b7280', director: '#2563eb', administrador: '#7c3aed' };

const EMPTY_FORM = {
  nombre: '', apellidos: '', email: '', password: '',
  cargo: '', ubicacion_oficina: '', role: 'asesor'
};

function UserManager({ currentUserRole, onToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingRoleId, setChangingRoleId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const token = localStorage.getItem('token');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/users`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      onToast('error', 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData(EMPTY_FORM);
        setShowForm(false);
        onToast('success', `Usuario ${formData.nombre} ${formData.apellidos} creado`);
        loadUsers();
      } else {
        const d = await res.json();
        onToast('error', d.error || 'Error al crear usuario');
      }
    } catch (err) {
      onToast('error', 'Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API}/api/v1/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        onToast('success', 'Rol actualizado');
        setChangingRoleId(null);
        loadUsers();
      } else {
        const d = await res.json();
        onToast('error', d.error || 'Error al cambiar rol');
      }
    } catch {
      onToast('error', 'Error al cambiar rol');
    }
  };

  const getInitials = u =>
    `${u.nombre?.charAt(0) || ''}${u.apellidos?.charAt(0) || ''}`.toUpperCase() || u.email?.charAt(0).toUpperCase();

  const isAdmin = currentUserRole === 'administrador';

  return (
    <div className="um-wrap">
      {/* Cabecera */}
      <div className="um-controls">
        <div>
          <h2 className="um-title">Equipo ({users.length})</h2>
          <p className="um-subtitle">Gestiona los miembros de tu organizaci�n</p>
        </div>
        <button className="um-btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {/* Formulario nuevo usuario */}
      {showForm && (
        <div className="um-form-card">
          <h3 className="um-form-title">Nuevo Usuario</h3>
          <form onSubmit={handleSubmit}>
            <div className="um-form-grid">
              <div className="um-field">
                <label>Nombre *</label>
                <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
              </div>
              <div className="um-field">
                <label>Apellidos *</label>
                <input name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Apellidos" required />
              </div>
              <div className="um-field">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="correo@empresa.com" required />
              </div>
              <div className="um-field">
                <label>Contrase�a *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contrase�a inicial" required />
              </div>
              <div className="um-field">
                <label>Cargo *</label>
                <input name="cargo" value={formData.cargo} onChange={handleChange} placeholder="Ej: Agente Inmobiliario" required />
              </div>
              <div className="um-field">
                <label>Ubicaci�n / Oficina *</label>
                <input name="ubicacion_oficina" value={formData.ubicacion_oficina} onChange={handleChange} placeholder="Ej: Oficina Madrid Centro" required />
              </div>
              <div className="um-field">
                <label>Rol</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="asesor">Asesor</option>
                  <option value="director">Director</option>
                  {isAdmin && <option value="administrador">Administrador</option>}
                </select>
              </div>
            </div>
            <div className="um-form-footer">
              <button type="button" className="um-btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="um-btn-save" disabled={saving}>
                {saving ? 'Creando�' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista usuarios */}
      <div className="um-list">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="um-row-skeleton" />)
        ) : users.length === 0 ? (
          <div className="um-empty">No hay usuarios en el equipo todavía.</div>
        ) : (
          users.map(u => (
            <div key={u.id} className="um-row">
              <div className="um-avatar" style={{ background: ROLE_COLORS[u.role] }}>
                {getInitials(u)}
              </div>

              <div className="um-info">
                <div className="um-name">{u.nombre} {u.apellidos}</div>
                <div className="um-meta">
                  <span className="um-cargo">{u.cargo}</span>
                  <span className="um-sep">·</span>
                  <span className="um-oficina">📍 {u.ubicacion_oficina}</span>
                </div>
                <div className="um-email">{u.email}</div>
              </div>

              <div className="um-role-area">
                {isAdmin && changingRoleId === u.id ? (
                  <div className="um-role-select-wrap">
                    <select
                      className="um-role-select"
                      defaultValue={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="asesor">Asesor</option>
                      <option value="director">Director</option>
                      <option value="administrador">Administrador</option>
                    </select>
                    <button className="um-role-cancel" onClick={() => setChangingRoleId(null)}>✕</button>
                  </div>
                ) : (
                  <div className="um-role-display">
                    <span className="um-role-badge" style={{ background: ROLE_COLORS[u.role] }}>
                      {ROLE_LABELS[u.role]}
                    </span>
                    {isAdmin && (
                      <button className="um-btn-role" onClick={() => setChangingRoleId(u.id)} title="Cambiar rol">
                        ✏
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="um-joined">
                Alta {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserManager;

