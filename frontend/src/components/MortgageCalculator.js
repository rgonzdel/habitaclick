import React, { useState, useMemo } from 'react';
import './MortgageCalculator.css';

const COMMUNITIES = [
  { value: 'madrid',        label: 'Comunidad de Madrid',   itp: 0.06  },
  { value: 'cataluna',      label: 'Cataluña',               itp: 0.10  },
  { value: 'andalucia',     label: 'Andalucía',              itp: 0.07  },
  { value: 'valencia',      label: 'Com. Valenciana',        itp: 0.10  },
  { value: 'galicia',       label: 'Galicia',                itp: 0.10  },
  { value: 'castilla_leon', label: 'Castilla y León',        itp: 0.08  },
  { value: 'castilla_lm',   label: 'Castilla-La Mancha',     itp: 0.09  },
  { value: 'pais_vasco',    label: 'País Vasco',             itp: 0.04  },
  { value: 'navarra',       label: 'Navarra',                itp: 0.06  },
  { value: 'aragon',        label: 'Aragón',                 itp: 0.08  },
  { value: 'murcia',        label: 'Murcia',                 itp: 0.08  },
  { value: 'extremadura',   label: 'Extremadura',            itp: 0.08  },
  { value: 'asturias',      label: 'Asturias',               itp: 0.08  },
  { value: 'cantabria',     label: 'Cantabria',              itp: 0.10  },
  { value: 'rioja',         label: 'La Rioja',               itp: 0.07  },
  { value: 'baleares',      label: 'Islas Baleares',         itp: 0.08  },
  { value: 'canarias',      label: 'Islas Canarias',         itp: 0.065 },
  { value: 'ceuta',         label: 'Ceuta',                  itp: 0.06  },
  { value: 'melilla',       label: 'Melilla',                itp: 0.06  },
];

// PMT: cuota mensual hipotecaria
function pmt(principal, annualRate, years) {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate === 0) return principal / (years * 12);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const fmt = n => Math.round(n).toLocaleString('es-ES');

// Slider con track relleno proporcional al valor
function Slider({ min, max, step, value, onChange, disabled }) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="mc-slider-wrap">
      <div
        className="mc-slider-track"
        style={{ background: disabled
          ? '#e5e7eb'
          : `linear-gradient(to right, #2563eb ${pct}%, #dbeafe ${pct}%)` }}
      >
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={e => onChange && onChange(Number(e.target.value))}
          disabled={disabled}
          className="mc-slider-input"
        />
      </div>
    </div>
  );
}

// Gráfico de tarta SVG
function PieChart({ loan, savings, interest }) {
  const total = loan + savings + interest;
  if (total <= 0) return null;

  const slices = [
    { value: loan,     color: '#1e3a5f' },
    { value: savings,  color: '#93c5fd' },
    { value: interest, color: '#bfdbfe' },
  ];

  const r = 55, cx = 70, cy = 70;
  let start = -Math.PI / 2;
  const paths = slices.map(({ value, color }, i) => {
    const pct = value / total;
    if (pct <= 0) return null;
    const angle = pct >= 0.9999 ? Math.PI * 2 - 0.001 : pct * Math.PI * 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const end = start + angle;
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    start = end;
    return <path key={i} d={d} fill={color} />;
  });

  return (
    <svg viewBox="0 0 140 140" className="mc-pie">
      {paths}
    </svg>
  );
}

export default function MortgageCalculator() {
  const [price,    setPrice]    = useState(250000);
  const [savings,  setSavings]  = useState(25000);
  const [years,    setYears]    = useState(30);
  const [rate,     setRate]     = useState(2.5);
  const [community, setCommunity] = useState('madrid');
  const [newBuild,  setNewBuild]  = useState(false);
  const [inclTax,   setInclTax]   = useState(true);

  // Impuestos automáticos según comunidad y estado
  const taxes = useMemo(() => {
    const comm = COMMUNITIES.find(c => c.value === community);
    const itpRate = comm?.itp ?? 0.06;
    const taxRate = newBuild ? 0.115 : itpRate + 0.021; // IVA 10%+AJD 1.5% vs ITP+gastos
    return Math.round(price * taxRate);
  }, [price, community, newBuild]);

  const results = useMemo(() => {
    const base = Math.max(0, price - savings);
    const loan = inclTax ? base + taxes : base;
    const monthly = pmt(loan, rate, years);
    const totalPaid = monthly * years * 12;
    const interest = Math.max(0, totalPaid - loan);
    const totalCost = price + interest + (inclTax ? 0 : taxes);
    return { loan, monthly, interest, totalCost };
  }, [price, savings, years, rate, taxes, inclTax]);

  const savingsPct = price > 0 ? Math.round((savings / price) * 100) : 0;

  return (
    <div className="mc-page">
      <div className="mc-wrap">

        {/* ── Formulario ── */}
        <div className="mc-form">
          <h2 className="mc-heading">Calculadora hipoteca</h2>

          {/* Precio */}
          <div className="mc-field">
            <label>Precio del inmueble</label>
            <div className="mc-input-row">
              <input type="number" value={price} min="0" max="10000000"
                onChange={e => setPrice(Math.max(0, Number(e.target.value) || 0))} />
              <span className="mc-unit">€</span>
            </div>
            <Slider min={50000} max={2000000} step={5000} value={price} onChange={setPrice} />
          </div>

          {/* Ahorro */}
          <div className="mc-field">
            <label>Ahorro aportado</label>
            <div className="mc-input-row">
              <input type="number" value={savings} min="0" max={price}
                onChange={e => setSavings(Math.min(price, Math.max(0, Number(e.target.value) || 0)))} />
              <span className="mc-unit">€</span>
              <span className="mc-pct">{savingsPct}%</span>
            </div>
            <Slider min={0} max={price} step={1000} value={savings} onChange={setSavings} />
          </div>

          {/* Plazo */}
          <div className="mc-field">
            <label>Plazo en años</label>
            <div className="mc-input-row">
              <input type="number" value={years} min="1" max="40"
                onChange={e => setYears(Math.min(40, Math.max(1, Number(e.target.value) || 1)))} />
              <span className="mc-unit">años</span>
            </div>
            <Slider min={1} max={40} step={1} value={years} onChange={setYears} />
          </div>

          {/* Tipo de interés */}
          <div className="mc-field">
            <label>Tipo de interés</label>
            <div className="mc-input-row">
              <input type="number" value={rate} min="0" max="15" step="0.1"
                onChange={e => setRate(Math.min(15, Math.max(0, Number(e.target.value) || 0)))} />
              <span className="mc-unit">%</span>
            </div>
            <Slider min={0} max={10} step={0.1} value={rate} onChange={setRate} />
          </div>

          {/* Impuestos (solo lectura, auto) */}
          <div className="mc-field">
            <label>Impuestos y gastos <span className="mc-auto">(calculado automáticamente)</span></label>
            <div className="mc-input-row">
              <input type="number" value={taxes} readOnly className="mc-readonly" />
              <span className="mc-unit">€</span>
            </div>
            <Slider min={0} max={price * 0.2} step={100} value={taxes} disabled />
          </div>

          {/* Selects */}
          <div className="mc-selects">
            <div className="mc-sel-field">
              <label>Localización</label>
              <select value={community} onChange={e => setCommunity(e.target.value)}>
                {COMMUNITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="mc-sel-field">
              <label>Estado</label>
              <select value={newBuild ? 'nueva' : 'segunda'} onChange={e => setNewBuild(e.target.value === 'nueva')}>
                <option value="segunda">Segunda mano</option>
                <option value="nueva">Nueva construcción</option>
              </select>
            </div>
          </div>

          <label className="mc-check">
            <input type="checkbox" checked={inclTax} onChange={e => setInclTax(e.target.checked)} />
            Incluir impuestos y gastos en hipoteca
          </label>
        </div>

        {/* ── Resultados ── */}
        <div className="mc-result">
          <h3 className="mc-result-title">Resultado</h3>
          <p className="mc-disclaimer">
            La información mostrada es únicamente orientativa y no constituye una oferta vinculante
            ni un compromiso contractual. Impuestos, gastos de compra e intereses son estimados.
          </p>

          <div className="mc-monthly-block">
            <span>Cuota mensual</span>
            <strong>{fmt(results.monthly)} €</strong>
          </div>

          <div className="mc-breakdown">
            <div className="mc-bk-item">
              <span>Importe hipoteca</span>
              <strong>{fmt(results.loan)} €</strong>
            </div>
            <div className="mc-bk-item">
              <span>Ahorro aportado</span>
              <strong>{fmt(savings)} €</strong>
            </div>
            <div className="mc-bk-item">
              <span>Interés hipoteca</span>
              <strong>{fmt(results.interest)} €</strong>
            </div>
          </div>

          <PieChart loan={results.loan} savings={savings} interest={results.interest} />

          <div className="mc-total-block">
            <span>Coste total con hipoteca</span>
            <strong>{fmt(results.totalCost)} €</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
