import React, { useState, useEffect } from 'react';
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
  const [editingUser, setEditingUser] = useState(null); // user being edited
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const token = localStorage.getItem('token');
  const isAdmin = currentUserRole === 'administrador';

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

  const handleEditChange = e =>
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

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

  const startEdit = (u) => {
    setEditingUser(u.id);
    setEditForm({
      nombre: u.nombre || '',
      apellidos: u.apellidos || '',
      email: u.email || '',
      cargo: u.cargo || '',
      ubicacion_oficina: u.ubicacion_oficina || '',
      role: u.role || 'asesor',
      password: ''
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const handleEditSubmit = async (userId) => {
    setEditSaving(true);
    try {
      const res = await fetch(`${API}/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        onToast('success', 'Usuario actualizado');
        setEditingUser(null);
        loadUsers();
      } else {
        const d = await res.json();
        onToast('error', d.error || 'Error al guardar cambios');
      }
    } catch {
      onToast('error', 'Error al guardar cambios');
    } finally {
      setEditSaving(false);
    }
  };

  const getInitials = u =>
    `${u.nombre?.charAt(0) || ''}${u.apellidos?.charAt(0) || ''}`.toUpperCase() || u.email?.charAt(0).toUpperCase();

  const fieldStyle = {
    width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px',
    border: '1.5px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit'
  };

  return (
    <div className="um-wrap">
      {/* Cabecera */}
      <div className="um-controls">
        <div>
          <h2 className="um-title">Equipo ({users.length})</h2>
          <p className="um-subtitle">Gestiona los miembros de tu organización</p>
        </div>
        {isAdmin && (
          <button className="um-btn-add" onClick={() => { setShowForm(!showForm); cancelEdit(); }}>
            {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
          </button>
        )}
      </div>

      {/* Formulario nuevo usuario */}
      {showForm && isAdmin && (
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
                <label>Contraseña *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña inicial" required />
              </div>
              <div className="um-field">
                <label>Cargo *</label>
                <input name="cargo" value={formData.cargo} onChange={handleChange} placeholder="Ej: Agente Inmobiliario" required />
              </div>
              <div className="um-field">
                <label>Oficina *</label>
                <input name="ubicacion_oficina" value={formData.ubicacion_oficina} onChange={handleChange} placeholder="Ej: Oficina Madrid Centro" required />
              </div>
              <div className="um-field">
                <label>Rol</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="asesor">Asesor</option>
                  <option value="director">Director</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>
            <div className="um-form-footer">
              <button type="button" className="um-btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="um-btn-save" disabled={saving}>
                {saving ? 'Creando…' : 'Crear Usuario'}
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
            <div key={u.id} className={`um-row ${editingUser === u.id ? 'um-row-editing' : ''}`}>
              {editingUser === u.id ? (
                /* Modo edición inline */
                <div className="um-edit-form">
                  <div className="um-edit-header">
                    <div className="um-avatar" style={{ background: ROLE_COLORS[u.role] }}>
                      {getInitials(u)}
                    </div>
                    <span className="um-edit-label">Editando usuario</span>
                  </div>
                  <div className="um-form-grid">
                    <div className="um-field">
                      <label>Nombre</label>
                      <input style={fieldStyle} name="nombre" value={editForm.nombre} onChange={handleEditChange} placeholder="Nombre" required />
                    </div>
                    <div className="um-field">
                      <label>Apellidos</label>
                      <input style={fieldStyle} name="apellidos" value={editForm.apellidos} onChange={handleEditChange} placeholder="Apellidos" required />
                    </div>
                    <div className="um-field">
                      <label>Email</label>
                      <input style={fieldStyle} type="email" name="email" value={editForm.email} onChange={handleEditChange} placeholder="email@empresa.com" required />
                    </div>
                    <div className="um-field">
                      <label>Nueva contraseña <span style={{ color: '#9ca3af', fontWeight: 400 }}>(dejar vacío para no cambiar)</span></label>
                      <input style={fieldStyle} type="password" name="password" value={editForm.password} onChange={handleEditChange} placeholder="Nueva contraseña" />
                    </div>
                    <div className="um-field">
                      <label>Cargo</label>
                      <input style={fieldStyle} name="cargo" value={editForm.cargo} onChange={handleEditChange} placeholder="Cargo" required />
                    </div>
                    <div className="um-field">
                      <label>Oficina</label>
                      <input style={fieldStyle} name="ubicacion_oficina" value={editForm.ubicacion_oficina} onChange={handleEditChange} placeholder="Oficina" required />
                    </div>
                    <div className="um-field">
                      <label>Rol</label>
                      <select style={fieldStyle} name="role" value={editForm.role} onChange={handleEditChange}>
                        <option value="asesor">Asesor</option>
                        <option value="director">Director</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </div>
                  </div>
                  <div className="um-form-footer">
                    <button className="um-btn-cancel" onClick={cancelEdit}>Cancelar</button>
                    <button className="um-btn-save" disabled={editSaving} onClick={() => handleEditSubmit(u.id)}>
                      {editSaving ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Vista normal */
                <>
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
                    <span className="um-role-badge" style={{ background: ROLE_COLORS[u.role] }}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </div>

                  <div className="um-joined">
                    Alta {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </div>

                  {isAdmin && (
                    <button className="um-btn-edit" onClick={() => startEdit(u)} title="Editar usuario">
                      ✏️ Editar
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserManager;
