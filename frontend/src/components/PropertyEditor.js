import React, { useState, useRef, useEffect } from 'react';
import './PropertyEditor.css';
import UserSearchInput from './UserSearchInput';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ROLE_COLORS = { asesor: '#6b7280', director: '#2563eb', administrador: '#7c3aed' };

function PropertyEditor({ property, onClose, onSaved, teamUsers = [], currentUserId = '' }) {
  const [formData, setFormData] = useState({
    title: property.title || '',
    price: property.price || '',
    address: property.address || '',
    city: property.city || '',
    province: property.province || '',
    property_type: property.property_type || 'apartment',
    transaction_type: property.transaction_type || 'sale',
    bedrooms: property.bedrooms || '',
    bathrooms: property.bathrooms || '',
    square_meters: property.square_meters || '',
    description: property.description || '',
    assigned_to: property.assigned_to || ''
  });

  const [media, setMedia] = useState(
    [...(property.photos || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dropZoneActive, setDropZoneActive] = useState(false);

  const dragIndexRef = useRef(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const pendingCount = useRef(0);

  const token = localStorage.getItem('token');

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Revocar blob URLs al desmontar
  useEffect(() => {
    return () => {
      media.forEach(item => { if (item._blobUrl) URL.revokeObjectURL(item._blobUrl); });
    };
  }, []);

  // ── Subida con preview local inmediata ────────────────────────
  const uploadFiles = async (files) => {
    if (!files.length) return;

    // Añadir previews locales inmediatamente
    const localItems = files.map(f => ({
      _localId: Math.random().toString(36).slice(2),
      _blobUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      _uploading: true,
      media_type: f.type.startsWith('video/') ? 'video' : 'photo',
      filename: f.name,
      id: null
    }));

    setMedia(prev => [...prev, ...localItems]);
    pendingCount.current += 1;
    setUploading(true);

    try {
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));

      const res = await fetch(`${API}/api/v1/properties/${property.id}/photos`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: fd
      });

      if (res.ok) {
        const data = await res.json();
        const localIds = new Set(localItems.map(l => l._localId));
        localItems.forEach(l => { if (l._blobUrl) URL.revokeObjectURL(l._blobUrl); });
        setMedia(prev => [
          ...prev.filter(m => !localIds.has(m._localId)),
          ...(data.photos || [])
        ]);
      } else {
        let errorMsg = `HTTP ${res.status}`;
        try { const d = await res.json(); errorMsg = d.error || errorMsg; } catch {}
        console.error('❌ Upload error:', errorMsg);
        setMedia(prev => prev.map(m =>
          localItems.find(l => l._localId === m._localId)
            ? { ...m, _uploading: false, _error: true, _errorMsg: errorMsg }
            : m
        ));
      }
    } catch (err) {
      const errorMsg = err.message || 'Error de red';
      console.error('❌ Upload catch:', errorMsg);
      setMedia(prev => prev.map(m =>
        localItems.find(l => l._localId === m._localId)
          ? { ...m, _uploading: false, _error: true, _errorMsg: errorMsg }
          : m
      ));
    } finally {
      pendingCount.current -= 1;
      if (pendingCount.current === 0) setUploading(false);
    }
  };

  const handleDeleteMedia = async (item) => {
    if (item.id) {
      await fetch(`${API}/api/v1/properties/${property.id}/photos/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      });
    }
    if (item._blobUrl) URL.revokeObjectURL(item._blobUrl);
    setMedia(prev => prev.filter(m =>
      item.id ? m.id !== item.id : m._localId !== item._localId
    ));
  };

  // ── Drag para reordenar ───────────────────────────────────────
  const handleDragStart = (e, index) => {
    dragIndexRef.current = index;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-reorder', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndexRef.current !== null && dragIndexRef.current !== index) {
      setHoverIndex(index);
    }
  };

  const handleDropOnItem = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    const next = [...media];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    setMedia(next);
    dragIndexRef.current = null;
    setDragIndex(null);
    setHoverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragIndex(null);
    setHoverIndex(null);
  };

  // ── Drop zone (añadir archivos) ───────────────────────────────
  const handleZoneDragOver = e => {
    e.preventDefault();
    if (dragIndexRef.current === null) setDropZoneActive(true);
  };

  const handleZoneDragLeave = e => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDropZoneActive(false);
  };

  const handleZoneDrop = e => {
    e.preventDefault();
    setDropZoneActive(false);
    if (dragIndexRef.current !== null) return;
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (files.length) uploadFiles(files);
  };

  // ── Guardar ───────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/v1/properties/${property.id}`, {
        method: 'PUT',
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

      // Solo reordenar los que ya están confirmados en el servidor
      const savedMedia = media.filter(m => m.id);
      if (savedMedia.length > 0) {
        const order = savedMedia.map((m, i) => ({
          id: m.id,
          sort_order: i,
          is_primary: i === 0 && m.media_type === 'photo'
        }));
        await fetch(`${API}/api/v1/properties/${property.id}/photos/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ order })
        });
      }

      onSaved();
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="pe-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pe-panel">

        <div className="pe-header">
          <h2>Editar propiedad</h2>
          <button className="pe-close" onClick={onClose}>✕</button>
        </div>

        <div className="pe-body">

          {/* Formulario izquierda */}
          <div className="pe-form">
            <p className="pe-section-title">Datos de la propiedad</p>

            {property.reference && (
              <div className="pe-reference">
                <span className="pe-reference-label">Ref.</span>
                <span className="pe-reference-value">{property.reference}</span>
              </div>
            )}

            <div className="pe-field">
              <label>Título</label>
              <input name="title" value={formData.title} onChange={handleChange} />
            </div>
            <div className="pe-field">
              <label>Precio (€)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} />
            </div>
            <div className="pe-field">
              <label>Dirección</label>
              <input name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="pe-row">
              <div className="pe-field">
                <label>Ciudad</label>
                <input name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="pe-field">
                <label>Provincia</label>
                <input name="province" value={formData.province} onChange={handleChange} />
              </div>
            </div>
            <div className="pe-row">
              <div className="pe-field">
                <label>Tipo</label>
                <select name="property_type" value={formData.property_type} onChange={handleChange}>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="land">Terreno</option>
                  <option value="commercial">Comercial</option>
                </select>
              </div>
              <div className="pe-field">
                <label>Operación</label>
                <select name="transaction_type" value={formData.transaction_type} onChange={handleChange}>
                  <option value="sale">Venta</option>
                  <option value="rent">Alquiler</option>
                </select>
              </div>
            </div>
            <div className="pe-row">
              <div className="pe-field">
                <label>Habitaciones</label>
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} />
              </div>
              <div className="pe-field">
                <label>Baños</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} />
              </div>
              <div className="pe-field">
                <label>m²</label>
                <input type="number" name="square_meters" value={formData.square_meters} onChange={handleChange} />
              </div>
            </div>
            <div className="pe-field">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe el inmueble..."
                className="pe-textarea"
              />
            </div>

            {/* Asignación */}
            <div className="pe-field">
              <label>Asesor responsable</label>
              <div className="pe-assign-wrap">
                <button
                  type="button"
                  className={`pe-assign-me${formData.assigned_to === currentUserId ? ' active' : ''}`}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    assigned_to: prev.assigned_to === currentUserId ? '' : currentUserId
                  }))}
                >
                  {formData.assigned_to === currentUserId ? '✓ Yo' : '👤 Asignarme'}
                </button>
                <UserSearchInput
                  users={teamUsers.filter(u => u.id !== currentUserId)}
                  value={formData.assigned_to !== currentUserId ? formData.assigned_to : ''}
                  onChange={id => setFormData(prev => ({ ...prev, assigned_to: id }))}
                  placeholder="Buscar compañero…"
                />
              </div>
            </div>

          </div>

          {/* Media derecha */}
          <div className="pe-media">
            <p className="pe-section-title">
              Fotos y vídeos
              <span className="pe-hint"> — arrastra para reordenar · la primera es la portada</span>
            </p>

            {/* Drop zone */}
            <div
              className={`pe-dropzone${dropZoneActive ? ' active' : ''}${uploading ? ' uploading' : ''}`}
              onDragOver={handleZoneDragOver}
              onDragLeave={handleZoneDragLeave}
              onDrop={handleZoneDrop}
            >
              {uploading ? (
                <span className="pe-dropzone-text">Subiendo archivos…</span>
              ) : (
                <>
                  <span className="pe-dropzone-text">
                    {dropZoneActive ? '¡Suelta aquí!' : 'Arrastra fotos o vídeos aquí para añadir'}
                  </span>
                  <label className="pe-pick-btn">
                    Seleccionar archivos
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files.length) {
                          uploadFiles(Array.from(e.target.files));
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </>
              )}
            </div>

            {/* Galería */}
            <div className="pe-gallery">
              {media.length === 0 && (
                <p className="pe-empty-media">Sin fotos. Añade arrastrando o usando el selector.</p>
              )}
              {media.map((item, index) => (
                <div
                  key={item.id || item._localId}
                  className={[
                    'pe-item',
                    dragIndex === index ? 'pe-item--dragging' : '',
                    hoverIndex === index ? 'pe-item--over' : '',
                    index === 0 && !item._uploading ? 'pe-item--primary' : '',
                    item._uploading ? 'pe-item--uploading' : '',
                    item._error ? 'pe-item--error' : ''
                  ].filter(Boolean).join(' ')}
                  draggable={!item._uploading}
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDropOnItem(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Contenido del tile */}
                  {item.media_type === 'video' ? (
                    <div className="pe-item-video">
                      <span className="pe-item-video-icon">🎬</span>
                      <span className="pe-item-video-name">{item.filename || 'vídeo'}</span>
                    </div>
                  ) : item._blobUrl ? (
                    <img src={item._blobUrl} alt={item.filename} draggable={false} />
                  ) : (
                    <img src={`${API}${item.url}`} alt={item.filename} draggable={false} />
                  )}

                  {/* Overlay subiendo */}
                  {item._uploading && (
                    <div className="pe-item-status-overlay pe-item-status-uploading">
                      <span className="pe-item-status-spinner" />
                      <span>Subiendo</span>
                    </div>
                  )}

                  {/* Overlay error */}
                  {item._error && (
                    <div className="pe-item-status-overlay pe-item-status-error" title={item._errorMsg}>
                      <span>⚠</span>
                      <span className="pe-item-error-msg">{item._errorMsg || 'Error'}</span>
                    </div>
                  )}

                  {index === 0 && !item._uploading && !item._error && (
                    <span className="pe-badge">PORTADA</span>
                  )}

                  <button
                    className="pe-item-delete"
                    onClick={() => handleDeleteMedia(item)}
                    title="Eliminar"
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pe-footer">
          <button className="pe-btn-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="pe-btn-save"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving ? 'Guardando…' : uploading ? 'Esperando subida…' : 'Guardar cambios'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default PropertyEditor;

