import React, { useState, useRef, useEffect } from 'react';
import './UserSearchInput.css';

const ROLE_COLORS = { asesor: '#6b7280', director: '#2563eb', administrador: '#7c3aed' };
const ROLE_LABELS = { asesor: 'Asesor', director: 'Director', administrador: 'Administrador' };

function UserSearchInput({ users = [], value, onChange, placeholder = 'Buscar compañero…' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const selectedUser = value ? users.find(u => u.id === value) : null;

  const filtered = query.trim()
    ? users.filter(u => {
        const full = `${u.nombre || ''} ${u.apellidos || ''} ${u.email} ${u.cargo || ''}`.toLowerCase();
        return full.includes(query.toLowerCase());
      })
    : users;

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (user) => {
    onChange(user.id);
    setQuery('');
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlighted]) select(filtered[highlighted]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="usi-wrap" ref={wrapRef}>
      {selectedUser ? (
        <div className="usi-selected">
          <span className="usi-dot" style={{ background: ROLE_COLORS[selectedUser.role] || '#6b7280' }} />
          <span className="usi-selected-name">
            {selectedUser.nombre && selectedUser.apellidos
              ? `${selectedUser.nombre} ${selectedUser.apellidos}`
              : selectedUser.email}
          </span>
          {selectedUser.cargo && <span className="usi-selected-cargo">{selectedUser.cargo}</span>}
          <span className="usi-selected-role" style={{ background: ROLE_COLORS[selectedUser.role] }}>
            {ROLE_LABELS[selectedUser.role]}
          </span>
          <button className="usi-clear" onClick={clear} title="Cambiar asesor">✕</button>
        </div>
      ) : (
        <div className="usi-input-wrap">
          <span className="usi-search-icon">🔍</span>
          <input
            ref={inputRef}
            className="usi-input"
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={e => { setQuery(e.target.value); setHighlighted(0); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {query && (
            <button className="usi-clear-query" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>✕</button>
          )}
        </div>
      )}

      {open && !selectedUser && filtered.length > 0 && (
        <ul className="usi-dropdown">
          {filtered.map((u, i) => {
            const name = u.nombre && u.apellidos ? `${u.nombre} ${u.apellidos}` : u.email;
            return (
              <li
                key={u.id}
                className={`usi-option${i === highlighted ? ' highlighted' : ''}`}
                onMouseDown={() => select(u)}
                onMouseEnter={() => setHighlighted(i)}
              >
                <span className="usi-opt-dot" style={{ background: ROLE_COLORS[u.role] || '#6b7280' }} />
                <span className="usi-opt-info">
                  <span className="usi-opt-name">{name}</span>
                  {u.cargo && <span className="usi-opt-cargo">{u.cargo}</span>}
                </span>
                <span className="usi-opt-role" style={{ background: ROLE_COLORS[u.role] }}>
                  {ROLE_LABELS[u.role]}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {open && !selectedUser && query && filtered.length === 0 && (
        <div className="usi-empty">Sin resultados para «{query}»</div>
      )}
    </div>
  );
}

export default UserSearchInput;
