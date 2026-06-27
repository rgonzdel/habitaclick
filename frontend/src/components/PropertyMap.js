import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function PropertyMap({ lat, lng, onLocationChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const cbRef = useRef(onLocationChange);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  cbRef.current = onLocationChange;

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      const data = await res.json();
      cbRef.current(lat, lng, data.address || {});
    } catch {
      cbRef.current(lat, lng, {});
    }
  }, []);

  const placeMarker = useCallback((lat, lng) => {
    if (!mapRef.current) return;
    mapRef.current.setView([lat, lng], 16);
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });
    }
  }, [reverseGeocode]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const initLat = (lat && lng) ? lat : 40.4168;
    const initLng = (lat && lng) ? lng : -3.7038;
    const zoom = (lat && lng) ? 15 : 6;

    mapRef.current = L.map(containerRef.current).setView([initLat, initLng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    if (lat && lng) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });
    }

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; }
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    placeMarker(lat, lng);
  }, [lat, lng, placeMarker]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=5&addressdetails=1&accept-language=es`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const selectSuggestion = (item) => {
    setSuggestions([]);
    setSearch('');
    const slat = parseFloat(item.lat);
    const slng = parseFloat(item.lon);
    placeMarker(slat, slng);
    cbRef.current(slat, slng, item.address || {});
  };

  return (
    <div className="pmap-wrap">
      <div className="pmap-search-row">
        <form onSubmit={handleSearch} className="pmap-form">
          <input
            className="pmap-input"
            value={search}
            onChange={e => { setSearch(e.target.value); if (!e.target.value) setSuggestions([]); }}
            placeholder="Busca la dirección en el mapa..."
          />
          <button type="submit" className="pmap-btn" disabled={searching}>
            {searching ? '…' : 'Buscar'}
          </button>
        </form>
        {suggestions.length > 0 && (
          <div className="pmap-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} type="button" className="pmap-suggestion" onClick={() => selectSuggestion(s)}>
                {s.display_name}
              </button>
            ))}
            <button type="button" className="pmap-suggestion pmap-close-btn" onClick={() => setSuggestions([])}>
              Cerrar lista
            </button>
          </div>
        )}
      </div>
      <div ref={containerRef} className="pmap-container" />
    </div>
  );
}
