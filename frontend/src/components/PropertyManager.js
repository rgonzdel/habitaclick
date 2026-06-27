import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Home, Building2, House, Store, Landmark, Tag, Key, Euro,
  Circle, Search, Download, Edit2, Trash2, Link2, Save,
  User, Video, Camera, SlidersHorizontal, Plus, X, ChevronLeft,
  ChevronRight, ListFilter, CheckSquare, ArrowUpDown, FileText,
  MapPin, LayoutList, Sparkles
} from 'lucide-react';
import { generateDescription } from '../utils/descriptionGenerator';

const PORTAL_META = {
  idealista:  { color: '#003082', name: 'Idealista',  logo: '/logos/portals/idealista.png'  },
  fotocasa:   { color: '#e30613', name: 'Fotocasa',   logo: '/logos/portals/fotocasa.png'   },
  pisos:      { color: '#f58220', name: 'Pisos.com',  logo: '/logos/portals/pisos.png'      },
  habitaclia: { color: '#6936b4', name: 'Habitaclia', logo: '/logos/portals/habitaclia.png' },
};
import PropertyEditor from './PropertyEditor';
import UserSearchInput from './UserSearchInput';
import './PropertyManager.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ESTADO_LABELS = { disponible: 'Disponible', reservado: 'Reservado', vendido: 'Vendido', alquilado: 'Alquilado' };
const ESTADO_COLORS = { disponible: '#22c55e', reservado: '#f59e0b', vendido: '#3b82f6', alquilado: '#8b5cf6' };
const TYPE_LABELS = { apartment: 'Apartamento', house: 'Casa', land: 'Terreno', commercial: 'Comercial' };

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes primero' },
  { value: 'oldest', label: 'Más antiguos primero' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'title_asc', label: 'Título A-Z' },
];

const NAV_ITEMS = [
  { id: 'all', Icon: LayoutList, label: 'Todos los inmuebles', filter: null },
  { id: 'div1', type: 'divider', label: 'ESTADO' },
  { id: 'disponible', color: '#22c55e', label: 'Disponible', filter: { field: 'estado', value: 'disponible' } },
  { id: 'reservado', color: '#f59e0b', label: 'Reservado', filter: { field: 'estado', value: 'reservado' } },
  { id: 'vendido', color: '#3b82f6', label: 'Vendido', filter: { field: 'estado', value: 'vendido' } },
  { id: 'alquilado', color: '#8b5cf6', label: 'Alquilado', filter: { field: 'estado', value: 'alquilado' } },
  { id: 'div2', type: 'divider', label: 'OPERACIÓN' },
  { id: 'sale', Icon: Euro, label: 'En venta', filter: { field: 'transaction_type', value: 'sale' } },
  { id: 'rent', Icon: Key, label: 'En alquiler', filter: { field: 'transaction_type', value: 'rent' } },
  { id: 'div3', type: 'divider', label: 'TIPO' },
  { id: 'apartment', Icon: Building2, label: 'Apartamentos', filter: { field: 'property_type', value: 'apartment' } },
  { id: 'house', Icon: House, label: 'Casas', filter: { field: 'property_type', value: 'house' } },
  { id: 'commercial', Icon: Store, label: 'Comercial', filter: { field: 'property_type', value: 'commercial' } },
  { id: 'land', Icon: Landmark, label: 'Terrenos', filter: { field: 'property_type', value: 'land' } },
];

const FILTER_TYPES = [
  { field: 'estado', label: 'Estado', opLabel: 'es', options: ['disponible','reservado','vendido','alquilado'] },
  { field: 'transaction_type', label: 'Operación', opLabel: 'es', options: ['sale','rent'] },
  { field: 'property_type', label: 'Tipo inmueble', opLabel: 'es', options: ['apartment','house','land','commercial'] },
  { field: 'city', label: 'Ciudad', opLabel: 'contiene', type: 'text' },
];

const VALUE_LABELS = {
  disponible:'Disponible', reservado:'Reservado', vendido:'Vendido', alquilado:'Alquilado',
  sale:'Venta', rent:'Alquiler',
  apartment:'Apartamento', house:'Casa', land:'Terreno', commercial:'Comercial',
};

// ── Photo carousel ──────────────────────────────────────────────────
function PhotoCarousel({ photos }) {
  const [idx, setIdx] = useState(0);
  const list = (photos || []).filter(p => p.media_type === 'photo');
  if (list.length === 0) return (
    <div className="pm-photo-placeholder">
      <Camera size={28} color="#d1d5db" />
    </div>
  );
  const prev = e => { e.stopPropagation(); setIdx(i => (i - 1 + list.length) % list.length); };
  const next = e => { e.stopPropagation(); setIdx(i => (i + 1) % list.length); };
  return (
    <div className="pm-photo-wrap">
      <img src={`${API}${list[idx].url}`} alt="" className="pm-photo-img" />
      {list.length > 1 && (
        <>
          <button className="pm-photo-btn pm-photo-prev" onClick={prev}><ChevronLeft size={16} /></button>
          <button className="pm-photo-btn pm-photo-next" onClick={next}><ChevronRight size={16} /></button>
        </>
      )}
      <div className="pm-photo-count"><Camera size={11} /> {list.length}</div>
    </div>
  );
}

// ── Add property modal ───────────────────────────────────────────────
function AddPropertyModal({ teamUsers, getCurrentUserId, showToast, loadProperties, onClose }) {
  const [form, setForm] = useState({
    title: '', price: '', address: '', city: '', province: '',
    property_type: 'apartment', transaction_type: 'sale', estado: 'disponible',
    bedrooms: '', bathrooms: '', square_meters: '', description: '', assigned_to: '',
  });
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleGenerateDescription = () => {
    const desc = generateDescription(form);
    set('description', desc);
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.city) {
      showToast('error', 'Título, precio y ciudad son obligatorios');
      return;
    }
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/v1/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          title: form.title,
          price: parseFloat(form.price),
          address: form.address,
          city: form.city,
          province: form.province,
          property_type: form.property_type,
          transaction_type: form.transaction_type,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
          square_meters: form.square_meters ? parseFloat(form.square_meters) : null,
          description: form.description || null,
          assigned_to: form.assigned_to || null,
          estado: form.estado,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const pid = data.property.id;
        const allFiles = [...photos, ...videos];
        if (allFiles.length > 0) {
          const fd = new FormData();
          allFiles.forEach(f => fd.append('files', f));
          await fetch(`${API}/api/v1/properties/${pid}/photos`, {
            method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd,
          });
        }
        showToast('success', 'Propiedad creada');
        loadProperties();
        onClose();
      } else {
        showToast('error', 'Error al crear la propiedad');
      }
    } catch (e) {
      showToast('error', 'Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const myId = getCurrentUserId();

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        <div className="pm-modal-head">
          <h3>Añadir inmueble</h3>
          <button className="pm-modal-x" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="pm-modal-body">
          <div className="pm-form-row">
            <div className="pm-field">
              <label>Título *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Piso en Calle Mayor, 5" />
            </div>
            <div className="pm-field pm-field-sm">
              <label>Precio (€) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="195000" />
            </div>
          </div>
          <div className="pm-form-row">
            <div className="pm-field">
              <label>Dirección</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Calle Mayor, 5, 2º A" />
            </div>
          </div>
          <div className="pm-form-row">
            <div className="pm-field">
              <label>Ciudad *</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Madrid" />
            </div>
            <div className="pm-field">
              <label>Provincia</label>
              <input value={form.province} onChange={e => set('province', e.target.value)} placeholder="Madrid" />
            </div>
          </div>
          <div className="pm-form-row">
            <div className="pm-field">
              <label>Tipo</label>
              <select value={form.property_type} onChange={e => set('property_type', e.target.value)}>
                <option value="apartment">Apartamento</option>
                <option value="house">Casa</option>
                <option value="land">Terreno</option>
                <option value="commercial">Comercial</option>
              </select>
            </div>
            <div className="pm-field">
              <label>Operación</label>
              <select value={form.transaction_type} onChange={e => set('transaction_type', e.target.value)}>
                <option value="sale">Venta</option>
                <option value="rent">Alquiler</option>
              </select>
            </div>
            <div className="pm-field">
              <label>Estado</label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)}>
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
                <option value="alquilado">Alquilado</option>
              </select>
            </div>
          </div>
          <div className="pm-form-row">
            <div className="pm-field pm-field-sm">
              <label>Habitaciones</label>
              <input type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="3" />
            </div>
            <div className="pm-field pm-field-sm">
              <label>Baños</label>
              <input type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="1" />
            </div>
            <div className="pm-field pm-field-sm">
              <label>m²</label>
              <input type="number" value={form.square_meters} onChange={e => set('square_meters', e.target.value)} placeholder="75" />
            </div>
          </div>
          <div className="pm-field">
            <div className="pm-label-row">
              <label>Descripción</label>
              <button type="button" className="pm-ai-btn" onClick={handleGenerateDescription}>
                <Sparkles size={13} /> Generar con IA
              </button>
            </div>
            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Rellena los campos de arriba y pulsa «Generar con IA»..." />
          </div>

          <div className="pm-field">
            <label>Asesor responsable</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`pm-assign-me${form.assigned_to === myId ? ' active' : ''}`}
                onClick={() => set('assigned_to', form.assigned_to === myId ? '' : myId)}
              >
                <User size={14} />
                {form.assigned_to === myId ? 'Asignado a mí' : 'Asignarme'}
              </button>
              <UserSearchInput
                users={teamUsers.filter(u => u.id !== myId)}
                value={form.assigned_to !== myId ? form.assigned_to : ''}
                onChange={id => set('assigned_to', id)}
                placeholder="Buscar compañero…"
              />
            </div>
          </div>

          <div className="pm-form-row">
            <div className="pm-field">
              <label>Fotografías</label>
              <label className="pm-upload-lbl" htmlFor="new-photos">
                <Camera size={15} />
                {photos.length > 0 ? `${photos.length} foto(s) seleccionada(s)` : 'Seleccionar fotos'}
              </label>
              <input id="new-photos" type="file" multiple accept="image/*" style={{ display: 'none' }}
                onChange={e => setPhotos(Array.from(e.target.files))} />
              {photos.length > 0 && (
                <div className="pm-thumb-row">
                  {photos.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt={f.name} className="pm-thumb" />)}
                </div>
              )}
            </div>
            <div className="pm-field">
              <label>Vídeos</label>
              <label className="pm-upload-lbl" htmlFor="new-videos">
                <Video size={15} />
                {videos.length > 0 ? `${videos.length} vídeo(s)` : 'Seleccionar vídeos'}
              </label>
              <input id="new-videos" type="file" multiple accept="video/*" style={{ display: 'none' }}
                onChange={e => setVideos(Array.from(e.target.files))} />
              {videos.length > 0 && (
                <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: '0.82rem', color: '#6b7280' }}>
                  {videos.map((f, i) => <li key={i}>{f.name}</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="pm-modal-foot">
          <button className="pm-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="pm-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear propiedad'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main PropertyManager ─────────────────────────────────────────────
export default function PropertyManager({ properties, loadProperties, showToast, teamUsers, getCurrentUserId, userRole }) {
  const [activeNav, setActiveNav] = useState('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [editingProperty, setEditingProperty] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [addingFilter, setAddingFilter] = useState({ field: 'estado', value: '' });
  const [portalStatuses, setPortalStatuses] = useState({});
  const [portalPopup, setPortalPopup] = useState(null); // { propertyId, key, rect }
  const popupHideTimer = useRef(null);
  const [togglingPortal, setTogglingPortal] = useState('');

  const loadPortalStatuses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/v1/portals/status`, { headers: { Authorization: 'Bearer ' + token } });
      const data = await res.json();
      setPortalStatuses(data.statuses || {});
    } catch {}
  }, []);

  useEffect(() => { loadPortalStatuses(); }, [loadPortalStatuses]);

  const togglePortal = async (propertyId, portal) => {
    const key = `${propertyId}-${portal}`;
    if (togglingPortal === key) return;
    const current = portalStatuses[propertyId]?.[portal];
    const next = current === 'active' ? false : true;
    setTogglingPortal(key);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/v1/portals/${portal}/properties/${propertyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ active: next }),
      });
      if (res.ok) {
        setPortalStatuses(prev => ({
          ...prev,
          [propertyId]: { ...(prev[propertyId] || {}), [portal]: next ? 'active' : 'inactive' },
        }));
        showToast('success', `${PORTAL_META[portal].name}: ${next ? 'publicado' : 'retirado'}`);
      }
    } catch {
      showToast('error', 'Error al actualizar portal');
    } finally {
      setTogglingPortal('');
    }
  };

  const showPortalPopup = (e, propertyId, key) => {
    clearTimeout(popupHideTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setPortalPopup({ propertyId, key, rect });
  };

  const hidePortalPopup = () => {
    popupHideTimer.current = setTimeout(() => setPortalPopup(null), 120);
  };

  const keepPortalPopup = () => {
    clearTimeout(popupHideTimer.current);
  };

  const ROLE_LEVEL = { asesor: 1, director: 2, administrador: 3 };
  const can = (...roles) => roles.some(r => ROLE_LEVEL[userRole] >= ROLE_LEVEL[r]);

  const navItem = NAV_ITEMS.find(n => n.id === activeNav);
  const navFilter = navItem?.filter;

  let displayed = [...properties];
  if (navFilter) displayed = displayed.filter(p => p[navFilter.field] === navFilter.value);
  filters.forEach(f => {
    if (f.type === 'text') displayed = displayed.filter(p => (p[f.field] || '').toLowerCase().includes(f.value.toLowerCase()));
    else displayed = displayed.filter(p => p[f.field] === f.value);
  });
  if (search) {
    const q = search.toLowerCase();
    displayed = displayed.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.city || '').toLowerCase().includes(q) ||
      (p.address || '').toLowerCase().includes(q) ||
      (p.reference || '').toLowerCase().includes(q)
    );
  }
  displayed = displayed.sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'oldest') return (a.id || 0) - (b.id || 0);
    if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
    return (b.id || 0) - (a.id || 0);
  });
  const displayedSlice = displayed.slice(0, itemsPerPage);

  const countFor = item => !item.filter ? properties.length : properties.filter(p => p[item.filter.field] === item.filter.value).length;

  const allSelected = displayedSlice.length > 0 && selectedIds.length === displayedSlice.length;
  const toggleSelect = id => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(allSelected ? [] : displayedSlice.map(p => p.id));

  const deleteProperty = async id => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/api/v1/properties/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
      setConfirmDeleteId(null);
      setSelectedIds(prev => prev.filter(x => x !== id));
      showToast('success', 'Propiedad eliminada');
      loadProperties();
    } catch { showToast('error', 'Error al eliminar'); }
  };

  const applyBulk = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    if (bulkAction === 'delete') {
      if (!window.confirm(`¿Eliminar ${selectedIds.length} propiedad(es)?`)) return;
      for (const id of selectedIds) await deleteProperty(id);
      setSelectedIds([]);
    } else if (bulkAction === 'export_csv') {
      exportCSV(properties.filter(p => selectedIds.includes(p.id)));
    }
    setBulkAction('');
  };

  const exportCSV = (items = displayed) => {
    const headers = ['Referencia','Título','Tipo','Operación','Estado','Precio (€)','Ciudad','Provincia','Hab.','Baños','m²','Descripción'];
    const rows = items.map(p => [
      p.reference || '-', p.title || '', TYPE_LABELS[p.property_type] || p.property_type || '',
      p.transaction_type === 'sale' ? 'Venta' : 'Alquiler', ESTADO_LABELS[p.estado] || p.estado || '',
      p.price || '', p.city || '', p.province || '', p.bedrooms || '', p.bathrooms || '', p.square_meters || '',
      (p.description || '').replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `habitaclick-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const addFilter = () => {
    if (!addingFilter.value) return;
    const ft = FILTER_TYPES.find(f => f.field === addingFilter.field);
    setFilters(prev => [...prev, { ...addingFilter, type: ft?.type || 'select', label: ft?.label, opLabel: ft?.opLabel }]);
    setAddingFilter({ field: 'estado', value: '' });
    setShowAddFilter(false);
  };
  const removeFilter = idx => setFilters(prev => prev.filter((_, i) => i !== idx));

  const activeLabel = navFilter ? (VALUE_LABELS[navFilter.value] || navFilter.value).toUpperCase() : 'TODOS';
  const addFtDef = FILTER_TYPES.find(f => f.field === addingFilter.field);

  const ppData = portalPopup
    ? { meta: PORTAL_META[portalPopup.key], active: portalStatuses[portalPopup.propertyId]?.[portalPopup.key] === 'active', togKey: `${portalPopup.propertyId}-${portalPopup.key}` }
    : null;

  const PortalPopupOverlay = portalPopup && ppData && ReactDOM.createPortal(
    <div
      className="pm-portal-popup-fixed"
      style={{
        top: portalPopup.rect.top + window.scrollY - 8,
        left: portalPopup.rect.left + portalPopup.rect.width / 2,
      }}
      onMouseEnter={keepPortalPopup}
      onMouseLeave={hidePortalPopup}
    >
      <div className="pm-pp-head">
        <img src={ppData.meta.logo} alt={ppData.meta.name} className="pm-pp-logo" />
        <span className="pm-pp-name">{ppData.meta.name}</span>
      </div>
      <div className="pm-pp-status">
        Estado: <strong style={{ color: ppData.active ? '#16a34a' : '#9ca3af' }}>
          {ppData.active ? 'Publicado' : 'No publicado'}
        </strong>
      </div>
      <button
        className={`pm-pp-btn${ppData.active ? ' pm-pp-btn-active' : ''}`}
        style={ppData.active ? {} : { background: ppData.meta.color }}
        onClick={() => { togglePortal(portalPopup.propertyId, portalPopup.key); setPortalPopup(null); }}
        disabled={togglingPortal === ppData.togKey}
      >
        {togglingPortal === ppData.togKey ? '…' : ppData.active ? '✓ Publicado — Retirar' : `Publicar en ${ppData.meta.name}`}
      </button>
    </div>,
    document.body
  );

  return (
    <div className="pm-layout">
      {PortalPopupOverlay}

      {/* ── LEFT NAV ─────────────────── */}
      <div className="pm-left-nav">
        <div className="pm-nav-header">
          <Home size={16} className="pm-nav-icon" />
          <span className="pm-nav-title">Inmuebles</span>
        </div>
        <div className="pm-nav-list">
          {NAV_ITEMS.map(item => {
            if (item.type === 'divider') return (
              <div key={item.id} className="pm-nav-divider"><span>{item.label}</span></div>
            );
            const count = countFor(item);
            const active = activeNav === item.id;
            return (
              <button key={item.id} className={`pm-nav-item${active ? ' active' : ''}`}
                onClick={() => { setActiveNav(item.id); setFilters([]); setSearch(''); }}>
                <span className="pm-nav-icon-wrap">
                  {item.color ? (
                    <Circle size={10} fill={item.color} color={item.color} />
                  ) : item.Icon ? (
                    <item.Icon size={15} />
                  ) : null}
                </span>
                <span className="pm-nav-label">{item.label}</span>
                {count > 0 && <span className="pm-nav-count">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTER PANEL ─────────────── */}
      <div className="pm-filter-panel">
        <div className="pm-filter-head">
          <h2 className="pm-filter-title">Mis inmuebles <span className="pm-filter-count">{displayed.length}</span></h2>
          <div className="pm-filter-active-label">{activeLabel}</div>
        </div>

        {(navFilter || filters.length > 0) && (
          <div className="pm-filter-section">
            <div className="pm-section-label">FILTROS DE BÚSQUEDA</div>
            {navFilter && (
              <div className="pm-active-filter pm-active-filter--fixed">
                <ListFilter size={13} className="pm-af-icon" />
                <div className="pm-af-text">
                  <div className="pm-af-field">{navFilter.field === 'estado' ? 'Estado' : navFilter.field === 'transaction_type' ? 'Operación' : 'Tipo'}</div>
                  <div className="pm-af-value">es {VALUE_LABELS[navFilter.value] || navFilter.value}</div>
                </div>
              </div>
            )}
            {filters.map((f, i) => (
              <div key={i} className="pm-active-filter">
                <ListFilter size={13} className="pm-af-icon" />
                <div className="pm-af-text">
                  <div className="pm-af-field">{f.label}</div>
                  <div className="pm-af-value">{f.opLabel} {VALUE_LABELS[f.value] || f.value}</div>
                </div>
                <button className="pm-af-del" onClick={() => removeFilter(i)} title="Eliminar filtro">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pm-filter-section">
          <div className="pm-section-label">AÑADIR FILTRO</div>
          {showAddFilter ? (
            <div className="pm-add-filter-form">
              <select value={addingFilter.field} onChange={e => setAddingFilter({ field: e.target.value, value: '' })} className="pm-sel">
                {FILTER_TYPES.map(ft => <option key={ft.field} value={ft.field}>{ft.label}</option>)}
              </select>
              {addFtDef?.type === 'text' ? (
                <input className="pm-inp" value={addingFilter.value} onChange={e => setAddingFilter(p => ({ ...p, value: e.target.value }))} placeholder="Valor..." />
              ) : (
                <select className="pm-sel" value={addingFilter.value} onChange={e => setAddingFilter(p => ({ ...p, value: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {(addFtDef?.options || []).map(o => <option key={o} value={o}>{VALUE_LABELS[o] || o}</option>)}
                </select>
              )}
              <div className="pm-add-filter-btns">
                <button className="pm-btn-primary-sm" onClick={addFilter}>Añadir</button>
                <button className="pm-btn-ghost-sm" onClick={() => setShowAddFilter(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="pm-add-filter-btn" onClick={() => setShowAddFilter(true)}>
              <Plus size={14} /> Añadir filtro
            </button>
          )}
        </div>

        <div className="pm-filter-section">
          <div className="pm-section-label">ORDENAR</div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="pm-sel pm-sel-full">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="pm-filter-section">
          <div className="pm-section-label">ELEMENTOS POR PÁGINA</div>
          <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="pm-sel pm-sel-full">
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="pm-filter-foot">
          {filters.length > 0 && (
            <button className="pm-clear-btn" onClick={() => setFilters([])}>Limpiar filtros</button>
          )}
          <button className="pm-save-btn" onClick={() => showToast('success', 'Búsqueda guardada')}>
            <Save size={14} /> Guardar búsqueda
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────── */}
      <div className="pm-main">

        {/* Top bar */}
        <div className="pm-topbar">
          <div className="pm-search-wrap">
            <Search size={15} className="pm-search-icon" />
            <input className="pm-search-input" type="text" placeholder="Buscar..." value={search}
              onChange={e => setSearch(e.target.value)} />
            {search && (
              <button className="pm-search-clear" onClick={() => setSearch('')}><X size={13} /></button>
            )}
            <button className="pm-search-btn">Buscar</button>
          </div>
          <div className="pm-topbar-right">
            {can('director') && (
              <button className="pm-btn-add" onClick={() => setShowAddForm(true)}>
                <Plus size={16} /> Añadir inmueble
              </button>
            )}
            <button className="pm-btn-export" onClick={() => exportCSV()} title="Exportar CSV">
              <Download size={15} /> CSV
            </button>
          </div>
        </div>

        {/* Bulk bar */}
        <div className="pm-bulkbar">
          <input type="checkbox" className="pm-chk" checked={allSelected} onChange={toggleAll} title="Seleccionar todos" />
          {selectedIds.length > 0 && (
            <span className="pm-selected-label">{selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}</span>
          )}
          <div style={{ flex: 1 }} />
          <select className="pm-bulk-sel" value={bulkAction} onChange={e => setBulkAction(e.target.value)}>
            <option value="">Selecciona una acción</option>
            <option value="export_csv">Exportar a CSV</option>
            {can('director') && <option value="delete">Eliminar seleccionados</option>}
          </select>
          <button className="pm-bulk-apply" onClick={applyBulk} disabled={!bulkAction || selectedIds.length === 0}>Aplicar</button>
        </div>

        {/* Property list */}
        <div className="pm-list">
          {displayedSlice.length === 0 ? (
            <div className="pm-empty">
              <Home size={36} color="#d1d5db" />
              <p>{search ? `Sin resultados para "${search}"` : 'No hay inmuebles con estos filtros.'}</p>
            </div>
          ) : (
            displayedSlice.map(p => {
              const pricePerM = p.price && p.square_meters
                ? (p.price / p.square_meters).toLocaleString('es-ES', { maximumFractionDigits: 0 })
                : null;
              const isSelected = selectedIds.includes(p.id);
              const isConfirming = confirmDeleteId === p.id;
              const photoCount = (p.photos || []).filter(ph => ph.media_type === 'photo').length;
              const videoCount = (p.photos || []).filter(ph => ph.media_type === 'video').length;
              return (
                <div key={p.id} className={`pm-card${isSelected ? ' selected' : ''}${isConfirming ? ' confirming' : ''}`}>

                  <div className="pm-card-chk">
                    <input type="checkbox" className="pm-chk" checked={isSelected} onChange={() => toggleSelect(p.id)} />
                  </div>

                  <div className="pm-card-photo">
                    <PhotoCarousel photos={p.photos} />
                    <div className="pm-card-estado" style={{ background: ESTADO_COLORS[p.estado] || '#6b7280' }}>
                      {ESTADO_LABELS[p.estado] || p.estado}
                    </div>
                  </div>

                  <div className="pm-card-info">
                    <div className="pm-card-head">
                      {p.reference && <span className="pm-card-ref">{p.reference}</span>}
                      <span className="pm-card-title">{p.title}</span>
                      <Link2 size={13} className="pm-card-linkicon" />
                    </div>

                    <div className="pm-card-priceline">
                      <span className="pm-card-price">{p.price?.toLocaleString('es-ES')} €</span>
                      {pricePerM && <span className="pm-card-perm2">{pricePerM} €/m²</span>}
                      <span className="pm-card-details">
                        {p.bedrooms ? `${p.bedrooms} hab. · ` : ''}
                        {p.bathrooms ? `${p.bathrooms} baño${p.bathrooms > 1 ? 's' : ''}. · ` : ''}
                        {p.square_meters ? `${p.square_meters} m²  · ` : ''}
                      </span>
                      <span className={`pm-tx-badge pm-tx-${p.transaction_type}`}>
                        {p.transaction_type === 'sale' ? 'Venta' : 'Alquiler'}
                      </span>
                    </div>

                    {p.description && <div className="pm-card-desc">{p.description}</div>}

                    {p.assigned_user && (
                      <div className="pm-card-asesor">
                        <User size={12} />
                        {p.assigned_user.nombre && p.assigned_user.apellidos
                          ? `${p.assigned_user.nombre} ${p.assigned_user.apellidos}`
                          : p.assigned_user.email}
                        {p.assigned_user.cargo && <span className="pm-asesor-cargo"> · {p.assigned_user.cargo}</span>}
                      </div>
                    )}

                    <div className="pm-portal-row">
                      {Object.entries(PORTAL_META).map(([key, meta]) => {
                        const active = portalStatuses[p.id]?.[key] === 'active';
                        return (
                          <div
                            key={key}
                            className={`pm-portal-icon${active ? ' active' : ''}`}
                            style={active ? { color: meta.color, borderColor: meta.color } : {}}
                            onMouseEnter={e => showPortalPopup(e, p.id, key)}
                            onMouseLeave={hidePortalPopup}
                            onClick={() => togglePortal(p.id, key)}
                          >
                            <img
                              src={meta.logo}
                              alt={meta.name}
                              className={`pm-portal-logo${active ? ' pm-portal-logo-active' : ''}`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="pm-card-tags">
                      <span className="pm-tag">{TYPE_LABELS[p.property_type] || p.property_type}</span>
                      {p.city && (
                        <span className="pm-tag">
                          <MapPin size={11} /> {p.city}{p.province ? `, ${p.province}` : ''}
                        </span>
                      )}
                      {p.address && <span className="pm-tag">{p.address}</span>}
                      {photoCount > 0 && <span className="pm-tag"><Camera size={11} /> {photoCount}</span>}
                      {videoCount > 0 && <span className="pm-tag"><Video size={11} /> {videoCount}</span>}
                    </div>
                  </div>

                  <div className="pm-card-actions">
                    {isConfirming ? (
                      <div className="pm-confirm-inline">
                        <span className="pm-confirm-text">¿Eliminar?</span>
                        <button className="pm-confirm-yes" onClick={() => deleteProperty(p.id)}>Sí</button>
                        <button className="pm-confirm-no" onClick={() => setConfirmDeleteId(null)}>No</button>
                      </div>
                    ) : (
                      <>
                        <button className="pm-act-btn" onClick={() => setEditingProperty(p)} title="Editar">
                          <Edit2 size={15} />
                        </button>
                        {can('director') && (
                          <button className="pm-act-btn pm-act-del" onClick={() => setConfirmDeleteId(p.id)} title="Eliminar">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {displayed.length > itemsPerPage && (
            <div className="pm-load-more">
              Mostrando {Math.min(itemsPerPage, displayed.length)} de {displayed.length}
              <button onClick={() => setItemsPerPage(n => n + 25)}>Cargar más</button>
            </div>
          )}
        </div>
      </div>

      {editingProperty && (
        <PropertyEditor
          property={editingProperty}
          teamUsers={teamUsers}
          currentUserId={getCurrentUserId()}
          onClose={() => setEditingProperty(null)}
          onSaved={() => { setEditingProperty(null); loadProperties(); showToast('success', 'Cambios guardados'); }}
        />
      )}

      {showAddForm && (
        <AddPropertyModal
          teamUsers={teamUsers}
          getCurrentUserId={getCurrentUserId}
          showToast={showToast}
          loadProperties={loadProperties}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
