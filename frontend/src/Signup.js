??import React, { useState } from 'react';
import './Auth.css';

function Signup({ onSignupSuccess, onBackToLanding }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, company_name: company })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        alert('Cuenta creada. ¡Bienvenido!');
        onSignupSuccess();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <video className="auth-video" autoPlay muted loop playsInline>
        <source src="/videos/VideoLandingMadrid.mp4" type="video/mp4" />
      </video>
      <div className="auth-overlay"></div>

      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        <button className="back-btn" onClick={onBackToLanding}>← Volver a inicio</button>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Contrase��a" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Nombre Empresa" 
            value={company} 
            onChange={(e) => setCompany(e.target.value)} 
            required 
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
