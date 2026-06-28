import React, { useState, useRef, useEffect } from 'react';
import { X, User, Check, Video, AlertTriangle, Sparkles, ChevronDown } from 'lucide-react';
import { generateDescription } from '../utils/descriptionGenerator';
import './PropertyEditor.css';
import UserSearchInput from './UserSearchInput';
import PropertyMap from './PropertyMap';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ENERGY_OPTS = ['en_tramite', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
const ENERGY_LABELS = { en_tramite: 'En trámite' };

const FEATURES = [
  { key: 'ascensor', label: 'Ascensor' },
  { key: 'exterior', label: 'Exterior' },
  { key: 'terraza', label: 'Terraza' },
  { key: 'armarios_empotrados', label: 'Armarios empotrados' },
  { key: 'aire_acondicionado', label: 'Aire acondicionado' },
  { key: 'cocina_amueblada', label: 'Cocina amueblada' },
  { key: 'cocina_equipada', label: 'Cocina equipada' },
  { key: 'luminoso', label: 'Luminoso' },
  { key: 'amueblado', label: 'Amueblado' },
  { key: 'garaje', label: 'Garaje' },
  { key: 'piscina', label: 'Piscina' },
  { key: 'jardin', label: 'Jardín' },
  { key: 'trastero', label: 'Trastero' },
  { key: 'calefaccion', label: 'Calefacción' },
  { key: 'portero', label: 'Portero' },
  { key: 'patio', label: 'Patio' },
];

const AGREEMENT_TYPES = [
  { value: '', label: '— Sin acuerdo —' },
  { value: 'exclusiva', label: 'Exclusiva' },
  { value: 'compartida', label: 'Compartida' },
  { value: 'abierta', label: 'Abierta' },
];

function Section({ title, sectionKey, open, onToggle, children }) {
  return (
    <div className="pe-section">
      <button type="button" className="pe-section-hdr" onClick={() => onToggle(sectionKey)}>
        <span>{title}</span>
        <ChevronDown size={15} className={`pe-sec-chevron${open ? ' open' : ''}`} />
      </button>
      {open && <div className="pe-section-body">{children}</div>}
    </div>
  );
}

function PropertyEditor({ property, onClose, onSaved, teamUsers = [], currentUserId = '' }) {
  const [formData, setFormData] = useState({
    title: property.title || '',
    price: property.price || '',
    address: property.address || '',
    city: property.city || '',
    province: property.province || '',
    property_type: property.property_type || 'apartment',
    transaction_type: property.transaction_type || 'sale',
    estado: property.estado || 'disponible',
    bedrooms: property.bedrooms ?? '',
    bathrooms: property.bathrooms ?? '',
    square_meters: property.square_meters ?? '',
    description: property.description || '',
    assigned_to: property.assigned_to || '',
    // Localización extra
    latitude: property.latitude || null,
    longitude: property.longitude || null,
    postal_code: property.postal_code || '',
    street_number: property.street_number || '',
    floor: property.floor || '',
    door: property.door || '',
    block_num: property.block_num || '',
    portal_door: property.portal_door || '',
    district: property.district || '',
    zone: property.zone || '',
    urbanization: property.urbanization || '',
    // Características extra
    useful_area: property.useful_area ?? '',
    year_built: property.year_built || '',
    community_fees: property.community_fees ?? '',
    show_price: property.show_price !== false,
    features: Array.isArray(property.features) ? property.features : [],
    // Energía
    energy_consumption_cert: property.energy_consumption_cert || 'en_tramite',
    energy_emission_cert: property.energy_emission_cert || 'en_tramite',
    energy_consumption_value: property.energy_consumption_value ?? '',
    co2_emission_value: property.co2_emission_value ?? '',
    video_url: property.video_url || '',
    virtual_tour_url: property.virtual_tour_url || '',
    // Privado
    cadastral_reference: property.cadastral_reference || '',
    owner: property.owner || '',
    second_owner: property.second_owner || '',
    has_keys: property.has_keys || false,
    key_reference: property.key_reference || '',
    sign_on_property: property.sign_on_property || false,
    ibi: property.ibi ?? '',
    // Acuerdo
    agreement_type: property.agreement_type || '',
    agreement_from: property.agreement_from || '',
    agreement_to: property.agreement_to || '',
    commission_percentage: property.commission_percentage ?? '',
    commission_value: property.commission_value ?? '',
    shared_commission_pct: property.shared_commission_pct ?? '',
    // Superficies extra
    terrace_area: property.terrace_area ?? '',
    garage_area: property.garage_area ?? '',
    garage_price: property.garage_price ?? '',
  });

  const [openSections, setOpenSections] = useState({
    localizacion: true,
    caracteristicas: true,
    descripcion: true,
    precios: false,
    privado: false,
    acuerdo: false,
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

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSection = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }));

  const toggleFeature = (key) => {
    setFormData(p => ({
      ...p,
      features: p.features.includes(key)
        ? p.features.filter(f => f !== key)
        : [...p.features, key],
    }));
  };

  const handleMapLocation = (lat, lng, addr) => {
    setFormData(p => ({
      ...p,
      latitude: lat,
      longitude: lng,
      address: addr.road || p.address,
      street_number: addr.house_number || p.street_number,
      city: addr.city || addr.town || addr.village || addr.municipality || p.city,
      province: addr.state || p.province,
      postal_code: addr.postcode || p.postal_code,
    }));
  };

  const handleGenerateDescription = () => {
    const desc = generateDescription(formData);
    setFormData(prev => ({ ...prev, description: desc }));
  };

  useEffect(() => {
    return () => {
      media.forEach(item => { if (item._blobUrl) URL.revokeObjectURL(item._blobUrl); });
    };
  }, []);

  const uploadFiles = async (files) => {
    if (!files.length) return;
    const localItems = files.map(f => ({
      _localId: Math.random().toString(36).slice(2),
      _blobUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      _uploading: true,
      media_type: f.type.startsWith('video/') ? 'video' : 'photo',
      filename: f.name,
      id: null,
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
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        const localIds = new Set(localItems.map(l => l._localId));
        localItems.forEach(l => { if (l._blobUrl) URL.revokeObjectURL(l._blobUrl); });
        setMedia(prev => [
          ...prev.filter(m => !localIds.has(m._localId)),
          ...(data.photos || []),
        ]);
      } else {
        let errorMsg = `HTTP ${res.status}`;
        try { const d = await res.json(); errorMsg = d.error || errorMsg; } catch {}
        setMedia(prev => prev.map(m =>
          localItems.find(l => l._localId === m._localId)
            ? { ...m, _uploading: false, _error: true, _errorMsg: errorMsg }
            : m
        ));
      }
    } catch (err) {
      const errorMsg = err.message || 'Error de red';
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
        headers: { Authorization: 'Bearer ' + token },
      });
    }
    if (item._blobUrl) URL.revokeObjectURL(item._blobUrl);
    setMedia(prev => prev.filter(m =>
      item.id ? m.id !== item.id : m._localId !== item._localId
    ));
  };

  const handleDragStart = (e, index) => {
    dragIndexRef.current = index;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-reorder', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndexRef.current !== null && dragIndexRef.current !== index) setHoverIndex(index);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/v1/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          title: formData.title,
          price: parseFloat(formData.price),
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          property_type: formData.property_type,
          transaction_type: formData.transaction_type,
          estado: formData.estado,
          bedrooms: formData.bedrooms !== '' ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms !== '' ? parseFloat(formData.bathrooms) : null,
          square_meters: formData.square_meters !== '' ? parseFloat(formData.square_meters) : null,
          description: formData.description || null,
          assigned_to: formData.assigned_to || null,
          postal_code: formData.postal_code || null,
          street_number: formData.street_number || null,
          floor: formData.floor || null,
          door: formData.door || null,
          block_num: formData.block_num || null,
          portal_door: formData.portal_door || null,
          district: formData.district || null,
          zone: formData.zone || null,
          urbanization: formData.urbanization || null,
          useful_area: formData.useful_area !== '' ? parseFloat(formData.useful_area) : null,
          year_built: formData.year_built !== '' ? parseInt(formData.year_built) : null,
          community_fees: formData.community_fees !== '' ? parseFloat(formData.community_fees) : null,
          show_price: formData.show_price,
          features: formData.features,
          energy_consumption_cert: formData.energy_consumption_cert,
          energy_emission_cert: formData.energy_emission_cert,
          energy_consumption_value: formData.energy_consumption_value !== '' ? parseFloat(formData.energy_consumption_value) : null,
          co2_emission_value: formData.co2_emission_value !== '' ? parseFloat(formData.co2_emission_value) : null,
          video_url: formData.video_url || null,
          virtual_tour_url: formData.virtual_tour_url || null,
          cadastral_reference: formData.cadastral_reference || null,
          owner: formData.owner || null,
          second_owner: formData.second_owner || null,
          has_keys: formData.has_keys,
          key_reference: formData.key_reference || null,
          sign_on_property: formData.sign_on_property,
          ibi: formData.ibi !== '' ? parseFloat(formData.ibi) : null,
          agreement_type: formData.agreement_type || null,
          agreement_from: formData.agreement_from || null,
          agreement_to: formData.agreement_to || null,
          commission_percentage: formData.commission_percentage !== '' ? parseFloat(formData.commission_percentage) : null,
          commission_value: formData.commission_value !== '' ? parseFloat(formData.commission_value) : null,
          shared_commission_pct: formData.shared_commission_pct !== '' ? parseFloat(formData.shared_commission_pct) : null,
          terrace_area: formData.terrace_area !== '' ? parseFloat(formData.terrace_area) : null,
          garage_area: formData.garage_area !== '' ? parseFloat(formData.garage_area) : null,
          garage_price: formData.garage_price !== '' ? parseFloat(formData.garage_price) : null,
        }),
      });

      const savedMedia = media.filter(m => m.id);
      if (savedMedia.length > 0) {
        const order = savedMedia.map((m, i) => ({
          id: m.id,
          sort_order: i,
          is_primary: i === 0 && m.media_type === 'photo',
        }));
        await fetch(`${API}/api/v1/properties/${property.id}/photos/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ order }),
        });
      }

      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pe-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pe-panel">

        <div className="pe-header">
          <div>
            <h2>Editar propiedad</h2>
            {property.reference && <span className="pe-ref-badge">{property.reference}</span>}
          </div>
          <button className="pe-close" onClick={onClose}><X size={18}/></button>
        </div>

        <div className="pe-body">

            {/* LOCALIZACIÓN */}
            <Section title="Localización" sectionKey="localizacion" open={openSections.localizacion} onToggle={toggleSection}>
              <div className="pe-loc-wrap">
                <div className="pe-loc-fields">
                  <div className="pe-row">
                    <div className="pe-field pe-field-grow">
                      <label>Calle / Dirección</label>
                      <input name="address" value={formData.address} onChange={handleChange} placeholder="Calle Mayor" />
                    </div>
                    <div className="pe-field pe-field-xs">
                      <label>Número</label>
                      <input name="street_number" value={formData.street_number} onChange={handleChange} placeholder="5" />
                    </div>
                  </div>
                  <div className="pe-row">
                    <div className="pe-field pe-field-xs">
                      <label>Planta</label>
                      <input name="floor" value={formData.floor} onChange={handleChange} placeholder="2" />
                    </div>
                    <div className="pe-field pe-field-xs">
                      <label>Puerta</label>
                      <input name="door" value={formData.door} onChange={handleChange} placeholder="A" />
                    </div>
                    <div className="pe-field pe-field-xs">
                      <label>Bloque</label>
                      <input name="block_num" value={formData.block_num} onChange={handleChange} placeholder="B" />
                    </div>
                    <div className="pe-field pe-field-xs">
                      <label>Portal</label>
                      <input name="portal_door" value={formData.portal_door} onChange={handleChange} placeholder="1" />
                    </div>
                  </div>
                  <div className="pe-row">
                    <div className="pe-field">
                      <label>Ciudad</label>
                      <input name="city" value={formData.city} onChange={handleChange} placeholder="Madrid" />
                    </div>
                    <div className="pe-field">
                      <label>Provincia</label>
                      <input name="province" value={formData.province} onChange={handleChange} placeholder="Madrid" />
                    </div>
                    <div className="pe-field pe-field-xs">
                      <label>C.P.</label>
                      <input name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="28001" />
                    </div>
                  </div>
                  <div className="pe-row">
                    <div className="pe-field">
                      <label>Distrito</label>
                      <input name="district" value={formData.district} onChange={handleChange} placeholder="Centro" />
                    </div>
                    <div className="pe-field">
                      <label>Zona</label>
                      <input name="zone" value={formData.zone} onChange={handleChange} placeholder="Chamberí" />
                    </div>
                    <div className="pe-field">
                      <label>Urbanización</label>
                      <input name="urbanization" value={formData.urbanization} onChange={handleChange} placeholder="" />
                    </div>
                  </div>
                </div>
                <div className="pe-loc-map">
                  <PropertyMap lat={formData.latitude} lng={formData.longitude} onLocationChange={handleMapLocation} />
                </div>
              </div>
            </Section>

            {/* CARACTERÍSTICAS */}
            <Section title="Características" sectionKey="caracteristicas" open={openSections.caracteristicas} onToggle={toggleSection}>
              <div className="pe-row">
                <div className="pe-field">
                  <label>Tipo</label>
                  <select name="property_type" value={formData.property_type} onChange={handleChange}>
                    <option value="apartment">Apartamento / Piso</option>
                    <option value="house">Casa / Chalet</option>
                    <option value="land">Terreno / Solar</option>
                    <option value="commercial">Local / Comercial</option>
                    <option value="garage">Garaje</option>
                    <option value="office">Oficina</option>
                    <option value="storage">Trastero</option>
                  </select>
                </div>
                <div className="pe-field">
                  <label>Operación</label>
                  <select name="transaction_type" value={formData.transaction_type} onChange={handleChange}>
                    <option value="sale">Venta</option>
                    <option value="rent">Alquiler</option>
                    <option value="both">Venta y Alquiler</option>
                  </select>
                </div>
                <div className="pe-field">
                  <label>Estado</label>
                  <select name="estado" value={formData.estado} onChange={handleChange}>
                    <option value="disponible">Disponible</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                    <option value="alquilado">Alquilado</option>
                  </select>
                </div>
              </div>
              <div className="pe-row">
                <div className="pe-field pe-field-xs">
                  <label>Habitaciones</label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min="0" />
                </div>
                <div className="pe-field pe-field-xs">
                  <label>Baños</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min="0" step="0.5" />
                </div>
                <div className="pe-field pe-field-sm">
                  <label>Superficie m²</label>
                  <input type="number" name="square_meters" value={formData.square_meters} onChange={handleChange} min="0" />
                </div>
                <div className="pe-field pe-field-sm">
                  <label>Sup. útil m²</label>
                  <input type="number" name="useful_area" value={formData.useful_area} onChange={handleChange} min="0" />
                </div>
              </div>
              <div className="pe-row">
                <div className="pe-field pe-field-sm">
                  <label>Sup. terraza m²</label>
                  <input type="number" name="terrace_area" value={formData.terrace_area} onChange={handleChange} min="0" />
                </div>
                <div className="pe-field pe-field-sm">
                  <label>Sup. garaje m²</label>
                  <input type="number" name="garage_area" value={formData.garage_area} onChange={handleChange} min="0" />
                </div>
                <div className="pe-field pe-field-xs">
                  <label>Año construcción</label>
                  <input type="number" name="year_built" value={formData.year_built} onChange={handleChange} min="1800" max="2099" />
                </div>
              </div>
              <div className="pe-field">
                <label>Características y etiquetas</label>
                <div className="pe-features">
                  {FEATURES.map(f => (
                    <button
                      key={f.key}
                      type="button"
                      className={`pe-feature-chip${formData.features.includes(f.key) ? ' active' : ''}`}
                      onClick={() => toggleFeature(f.key)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* DESCRIPCIÓN */}
            <Section title="Descripción" sectionKey="descripcion" open={openSections.descripcion} onToggle={toggleSection}>
              <div className="pe-field">
                <label>Título del inmueble</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="Piso en Calle Mayor, 5" />
              </div>
              <div className="pe-field">
                <div className="pm-label-row">
                  <label>Descripción</label>
                  <button type="button" className="pm-ai-btn" onClick={handleGenerateDescription}>
                    <Sparkles size={13} /> Generar con IA
                  </button>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Rellena los campos de arriba y pulsa «Generar con IA»..."
                  className="pe-textarea"
                />
              </div>
              <div className="pe-field">
                <label>Asesor responsable</label>
                <div className="pe-assign-wrap">
                  <button
                    type="button"
                    className={`pe-assign-me${formData.assigned_to === currentUserId ? ' active' : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      assigned_to: prev.assigned_to === currentUserId ? '' : currentUserId,
                    }))}
                  >
                    {formData.assigned_to === currentUserId ? <><Check size={13}/> Yo</> : <><User size={13}/> Asignarme</>}
                  </button>
                  <UserSearchInput
                    users={teamUsers.filter(u => u.id !== currentUserId)}
                    value={formData.assigned_to !== currentUserId ? formData.assigned_to : ''}
                    onChange={id => setFormData(prev => ({ ...prev, assigned_to: id }))}
                    placeholder="Buscar compañero…"
                  />
                </div>
              </div>
            </Section>

            {/* PRECIOS Y ENERGÍA */}
            <Section title="Precios, energía y media" sectionKey="precios" open={openSections.precios} onToggle={toggleSection}>
              <div className="pe-row">
                <div className="pe-field">
                  <label>Precio (€)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} />
                </div>
                <div className="pe-field pe-field-sm">
                  <label>Gastos com. €/mes</label>
                  <input type="number" name="community_fees" value={formData.community_fees} onChange={handleChange} min="0" />
                </div>
                <div className="pe-field pe-field-sm">
                  <label>Precio garaje (€)</label>
                  <input type="number" name="garage_price" value={formData.garage_price} onChange={handleChange} min="0" />
                </div>
              </div>
              <div className="pe-row pe-row-check">
                <label className="pe-check-label">
                  <input type="checkbox" name="show_price" checked={formData.show_price} onChange={handleChange} />
                  Mostrar precio públicamente
                </label>
              </div>
              <div className="pe-row">
                <div className="pe-field">
                  <label>Cert. consumo energético</label>
                  <select name="energy_consumption_cert" value={formData.energy_consumption_cert} onChange={handleChange}>
                    {ENERGY_OPTS.map(o => <option key={o} value={o}>{ENERGY_LABELS[o] || o}</option>)}
                  </select>
                </div>
                <div className="pe-field">
                  <label>Cert. emisión energética</label>
                  <select name="energy_emission_cert" value={formData.energy_emission_cert} onChange={handleChange}>
                    {ENERGY_OPTS.map(o => <option key={o} value={o}>{ENERGY_LABELS[o] || o}</option>)}
                  </select>
                </div>
              </div>
              <div className="pe-row">
                <div className="pe-field">
                  <label>Consumo kWh/m²</label>
                  <input type="number" name="energy_consumption_value" value={formData.energy_consumption_value} onChange={handleChange} min="0" />
                </div>
                <div className="pe-field">
                  <label>Emisión CO₂ kgCO₂/m²</label>
                  <input type="number" name="co2_emission_value" value={formData.co2_emission_value} onChange={handleChange} min="0" />
                </div>
              </div>
              <div className="pe-field">
                <label>Link al vídeo</label>
                <input name="video_url" value={formData.video_url} onChange={handleChange} placeholder="https://youtube.com/..." />
              </div>
              <div className="pe-field">
                <label>Link a visita virtual</label>
                <input name="virtual_tour_url" value={formData.virtual_tour_url} onChange={handleChange} placeholder="https://..." />
              </div>
            </Section>

            {/* DATOS PRIVADOS */}
            <Section title="Datos privados (opcional)" sectionKey="privado" open={openSections.privado} onToggle={toggleSection}>
              <div className="pe-row">
                <div className="pe-field">
                  <label>Propietario</label>
                  <input name="owner" value={formData.owner} onChange={handleChange} />
                </div>
                <div className="pe-field">
                  <label>Segundo propietario</label>
                  <input name="second_owner" value={formData.second_owner} onChange={handleChange} />
                </div>
              </div>
              <div className="pe-field">
                <label>Referencia catastral</label>
                <input name="cadastral_reference" value={formData.cadastral_reference} onChange={handleChange} />
              </div>
              <div className="pe-field">
                <label>IBI (€/año)</label>
                <input type="number" name="ibi" value={formData.ibi} onChange={handleChange} min="0" />
              </div>
              <div className="pe-row pe-row-check">
                <label className="pe-check-label">
                  <input type="checkbox" name="has_keys" checked={formData.has_keys} onChange={handleChange} />
                  Tenemos las llaves
                </label>
                <label className="pe-check-label">
                  <input type="checkbox" name="sign_on_property" checked={formData.sign_on_property} onChange={handleChange} />
                  Cartel en inmueble
                </label>
              </div>
              {formData.has_keys && (
                <div className="pe-field">
                  <label>Referencia llavero</label>
                  <input name="key_reference" value={formData.key_reference} onChange={handleChange} />
                </div>
              )}
            </Section>

            {/* ACUERDO */}
            <Section title="Acuerdo y comisión (opcional)" sectionKey="acuerdo" open={openSections.acuerdo} onToggle={toggleSection}>
              <div className="pe-field">
                <label>Tipo de acuerdo</label>
                <select name="agreement_type" value={formData.agreement_type} onChange={handleChange}>
                  {AGREEMENT_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="pe-row">
                <div className="pe-field">
                  <label>Válido desde</label>
                  <input type="date" name="agreement_from" value={formData.agreement_from} onChange={handleChange} />
                </div>
                <div className="pe-field">
                  <label>Válido hasta</label>
                  <input type="date" name="agreement_to" value={formData.agreement_to} onChange={handleChange} />
                </div>
              </div>
              <div className="pe-row">
                <div className="pe-field">
                  <label>Comisión %</label>
                  <input type="number" name="commission_percentage" value={formData.commission_percentage} onChange={handleChange} min="0" max="100" step="0.1" />
                </div>
                <div className="pe-field">
                  <label>Comisión valor (€)</label>
                  <input type="number" name="commission_value" value={formData.commission_value} onChange={handleChange} min="0" />
                </div>
                <div className="pe-field">
                  <label>Comisión compartida %</label>
                  <input type="number" name="shared_commission_pct" value={formData.shared_commission_pct} onChange={handleChange} min="0" max="100" step="0.1" />
                </div>
              </div>
            </Section>

          {/* ── Fotos y vídeos ── */}
          <div className="pe-media-block">
            <p className="pe-section-title">
              Fotos y vídeos
              <span className="pe-hint"> — arrastra para reordenar · la primera es la portada</span>
            </p>

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
                    item._error ? 'pe-item--error' : '',
                  ].filter(Boolean).join(' ')}
                  draggable={!item._uploading}
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDropOnItem(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {item.media_type === 'video' ? (
                    <div className="pe-item-video">
                      <span className="pe-item-video-icon"><Video size={22}/></span>
                      <span className="pe-item-video-name">{item.filename || 'vídeo'}</span>
                    </div>
                  ) : item._blobUrl ? (
                    <img src={item._blobUrl} alt={item.filename} draggable={false} />
                  ) : (
                    <img src={`${API}${item.url}`} alt={item.filename} draggable={false} />
                  )}
                  {item._uploading && (
                    <div className="pe-item-status-overlay pe-item-status-uploading">
                      <span className="pe-item-status-spinner" />
                      <span>Subiendo</span>
                    </div>
                  )}
                  {item._error && (
                    <div className="pe-item-status-overlay pe-item-status-error" title={item._errorMsg}>
                      <AlertTriangle size={16}/>
                      <span className="pe-item-error-msg">{item._errorMsg || 'Error'}</span>
                    </div>
                  )}
                  {index === 0 && !item._uploading && !item._error && (
                    <span className="pe-badge">PORTADA</span>
                  )}
                  <button className="pe-item-delete" onClick={() => handleDeleteMedia(item)} title="Eliminar">
                    <X size={12}/>
                  </button>
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
