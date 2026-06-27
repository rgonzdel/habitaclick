import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import './PortalSettings.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const PORTAL_META = {
  idealista: {
    name: 'Idealista',
    color: '#003082',
    logo: '/logos/portals/idealista.png',
    desc: 'El portal inmobiliario líder en España.',
  },
  fotocasa: {
    name: 'Fotocasa',
    color: '#e30613',
    logo: '/logos/portals/fotocasa.png',
    desc: 'Segundo mayor portal de viviendas en España.',
  },
  pisos: {
    name: 'Pisos.com',
    color: '#f58220',
    logo: '/logos/portals/pisos.png',
    desc: 'Portal generalista con gran alcance nacional.',
  },
  habitaclia: {
    name: 'Habitaclia',
    color: '#6936b4',
    logo: '/logos/portals/habitaclia.png',
    desc: 'Referente en el mercado catalán.',
  },
};

export default function PortalSettings({ showToast }) {
  const [credentials, setCredentials] = useState({});
  const [feedTokens, setFeedTokens] = useState({});
  const [editing, setEditing] = useState({});
  const [expanded, setExpanded] = useState({});
  const [copied, setCopied] = useState('');
  const [saving, setSaving] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { loadCredentials(); }, []);

  const loadCredentials = async () => {
    try {
      const res = await fetch(`${API}/api/v1/portals/credentials`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();
      const map = {};
      const feedMap = {};
      (data.credentials || []).forEach(c => {
        map[c.portal] = c;
        if (c.feed_token) feedMap[c.portal] = c.feed_token;
      });
      setCredentials(map);
      setFeedTokens(feedMap);
    } catch {}
  };

  const handleSave = async (portal) => {
    setSaving(portal);
    try {
      const fields = editing[portal] || {};
      const res = await fetch(`${API}/api/v1/portals/credentials/${portal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ enabled: true, ...fields }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedTokens(prev => ({ ...prev, [portal]: data.feed_token }));
        setEditing(prev => ({ ...prev, [portal]: {} }));
        showToast('success', `${PORTAL_META[portal].name} configurado`);
        loadCredentials();
      } else {
        showToast('error', data.error || 'Error al guardar');
      }
    } catch {
      showToast('error', 'Error de conexión');
    } finally {
      setSaving('');
    }
  };

  const copyFeedUrl = (portal) => {
    const ft = feedTokens[portal];
    if (!ft) return;
    const url = `${API}/api/v1/feed/${ft}/${portal}.xml`;
    navigator.clipboard.writeText(url);
    setCopied(portal);
    setTimeout(() => setCopied(''), 2000);
  };

  const getFeedUrl = (portal) => {
    const ft = feedTokens[portal];
    if (!ft) return null;
    return `${API}/api/v1/feed/${ft}/${portal}.xml`;
  };

  return (
    <div className="ps-root">
      <div className="ps-header">
        <Settings size={20} />
        <div>
          <h2 className="ps-title">Portales inmobiliarios</h2>
          <p className="ps-subtitle">Activa los portales y configura tus credenciales. Cada portal tiene una URL de feed XML única que debes entregar al portal para que importe tus inmuebles automáticamente.</p>
        </div>
      </div>

      <div className="ps-how">
        <strong>¿Cómo funciona?</strong>
        <ol>
          <li>Activa el portal y guarda (se genera tu URL de feed).</li>
          <li>Copia la URL XML y entrégasela al portal (normalmente en tu cuenta de anunciante).</li>
          <li>En cada inmueble, activa los portales donde quieras publicarlo con los iconos de la ficha.</li>
          <li>El portal importará tus inmuebles activos automáticamente.</li>
        </ol>
      </div>

      <div className="ps-list">
        {Object.entries(PORTAL_META).map(([key, meta]) => {
          const cred = credentials[key];
          const feedUrl = getFeedUrl(key);
          const isOpen = expanded[key];
          const edit = editing[key] || {};

          return (
            <div key={key} className="ps-card">
              <div className="ps-card-head" onClick={() => setExpanded(p => ({ ...p, [key]: !p[key] }))}>
                <div className="ps-portal-badge" style={{ background: meta.color }}>
                  <img src={meta.logo} alt={meta.name} className="ps-portal-logo" />
                </div>
                <div className="ps-portal-info">
                  <div className="ps-portal-name">{meta.name}</div>
                  <div className="ps-portal-desc">{meta.desc}</div>
                </div>
                <div className="ps-portal-status">
                  {feedUrl ? (
                    <span className="ps-status-active">Feed activo</span>
                  ) : (
                    <span className="ps-status-inactive">Sin configurar</span>
                  )}
                </div>
                {isOpen ? <ChevronUp size={18} className="ps-chevron" /> : <ChevronDown size={18} className="ps-chevron" />}
              </div>

              {isOpen && (
                <div className="ps-card-body">
                  {feedUrl && (
                    <div className="ps-feed-section">
                      <div className="ps-feed-label">URL del feed XML (entregar al portal)</div>
                      <div className="ps-feed-row">
                        <input readOnly value={feedUrl} className="ps-feed-input" onClick={e => e.target.select()} />
                        <button className="ps-copy-btn" onClick={() => copyFeedUrl(key)} title="Copiar URL">
                          {copied === key ? <Check size={15} /> : <Copy size={15} />}
                          {copied === key ? 'Copiado' : 'Copiar'}
                        </button>
                        <a href={feedUrl} target="_blank" rel="noopener noreferrer" className="ps-preview-btn" title="Ver XML">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="ps-creds-section">
                    <div className="ps-creds-label">Credenciales API (opcional — para publicación directa)</div>
                    <div className="ps-creds-row">
                      <input
                        className="ps-inp"
                        placeholder={cred?.api_key || 'API Key / Client ID'}
                        onChange={e => setEditing(p => ({ ...p, [key]: { ...p[key], api_key: e.target.value } }))}
                        value={edit.api_key ?? ''}
                      />
                      <input
                        className="ps-inp"
                        type="password"
                        placeholder={cred?.api_secret ? '••••' : 'API Secret / Client Secret'}
                        onChange={e => setEditing(p => ({ ...p, [key]: { ...p[key], api_secret: e.target.value } }))}
                        value={edit.api_secret ?? ''}
                      />
                    </div>
                  </div>

                  <div className="ps-card-foot">
                    <button
                      className="ps-save-btn"
                      onClick={() => handleSave(key)}
                      disabled={saving === key}
                      style={{ background: meta.color }}
                    >
                      {saving === key ? 'Guardando…' : feedUrl ? 'Actualizar' : 'Activar portal'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
