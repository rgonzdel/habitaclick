import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapModule.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const STATUS_META = {
  disponible: { color: '#22c55e', label: 'Disponible' },
  reservado:  { color: '#f59e0b', label: 'Reservado' },
  alquilado:  { color: '#8b5cf6', label: 'Alquilado' },
  vendido:    { color: '#94a3b8', label: 'Vendido' },
};

function makeIcon(status, size = 14) {
  const color = STATUS_META[status]?.color || '#6b7280';
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const fmt = (n) => n != null && n !== '' ? Number(n).toLocaleString('es-ES') + ' €' : null;

function PreviewCard({ property, pos, mapWidth }) {
  const cardWidth = 240;
  const gap = 18;
  const flip = pos.x + cardWidth + gap > mapWidth;
  const left = flip ? pos.x - cardWidth - gap : pos.x + gap;
  const top = Math.max(8, pos.y - 70);
  const primary = property.photos?.find(p => p.is_primary) || property.photos?.[0];

  return (
    <div className="mm-preview" style={{ left, top }}>
      {primary && (
        <img className="mm-preview-img" src={`${API}${primary.url}`} alt="" />
      )}
      <div className="mm-preview-body">
        <span className="mm-preview-badge" style={{ background: STATUS_META[property.estado]?.color }}>
          {STATUS_META[property.estado]?.label || property.estado}
        </span>
        <p className="mm-preview-title">{property.title}</p>
        {fmt(property.price) && <p className="mm-preview-price">{fmt(property.price)}</p>}
        <p className="mm-preview-details">
          {[
            property.bedrooms != null && `${property.bedrooms} hab.`,
            property.bathrooms != null && `${property.bathrooms} baños`,
            property.square_meters != null && `${property.square_meters} m²`,
          ].filter(Boolean).join(' · ') || null}
        </p>
        {(property.address || property.city) && (
          <p className="mm-preview-addr">{[property.address, property.city].filter(Boolean).join(', ')}</p>
        )}
      </div>
    </div>
  );
}

export default function MapModule({ token }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapWidthRef = useRef(0);

  const [properties, setProperties] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [hoverPx, setHoverPx] = useState({ x: 0, y: 0 });
  const [showSold, setShowSold] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all properties
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/v1/properties?limit=1000`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(r => r.json())
      .then(data => setProperties(data.properties || data || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [token]);

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    mapRef.current = L.map(mapContainerRef.current, { scrollWheelZoom: true }).setView([40.4, -3.7], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []); // eslint-disable-line

  // Add markers when properties or showSold changes
  useEffect(() => {
    if (!mapRef.current) return;
    // Remove existing markers
    mapRef.current.eachLayer(l => { if (l instanceof L.Marker) mapRef.current.removeLayer(l); });

    const visible = showSold
      ? properties
      : properties.filter(p => p.estado !== 'vendido');

    const bounds = [];

    visible.forEach(p => {
      if (!p.latitude || !p.longitude) return;
      bounds.push([p.latitude, p.longitude]);
      const marker = L.marker([p.latitude, p.longitude], { icon: makeIcon(p.estado) })
        .addTo(mapRef.current);

      marker.on('mouseover', (e) => {
        mapWidthRef.current = mapContainerRef.current?.offsetWidth || 800;
        setHoverPx({ x: e.containerPoint.x, y: e.containerPoint.y });
        setHovered(p);
      });
      marker.on('mouseout', () => setHovered(null));
    });

    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [properties, showSold]);

  const withCoords = properties.filter(p => p.latitude && p.longitude);
  const without = properties.length - withCoords.length;

  return (
    <div className="mm-wrap">
      <div className="mm-toolbar">
        <span className="mm-toolbar-title">Mapa de inmuebles</span>
        <div className="mm-legend">
          {Object.entries(STATUS_META).map(([k, v]) => (
            <span key={k} className="mm-legend-item">
              <span className="mm-dot" style={{ background: v.color }} />
              {v.label}
            </span>
          ))}
        </div>
        <label className="mm-toggle">
          <input type="checkbox" checked={showSold} onChange={e => setShowSold(e.target.checked)} />
          Mostrar vendidos
        </label>
        {without > 0 && (
          <span className="mm-no-coords">{without} sin ubicación</span>
        )}
        {loading && <span className="mm-loading">Cargando…</span>}
      </div>

      <div className="mm-map-outer">
        <div ref={mapContainerRef} className="mm-map-inner" />
        {hovered && (
          <PreviewCard property={hovered} pos={hoverPx} mapWidth={mapWidthRef.current} />
        )}
      </div>
    </div>
  );
}
