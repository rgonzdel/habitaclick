import React, { useState, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import { FileDown } from 'lucide-react';
import './MortgageCalculator.css';

const COMMUNITIES = [
  { value: 'madrid',        label: 'Comunidad de Madrid',  itp: 0.06,  ajd: 0.0075 },
  { value: 'cataluna',      label: 'Cataluña',              itp: 0.10,  ajd: 0.015  },
  { value: 'andalucia',     label: 'Andalucía',             itp: 0.07,  ajd: 0.012  },
  { value: 'valencia',      label: 'Com. Valenciana',       itp: 0.10,  ajd: 0.015  },
  { value: 'galicia',       label: 'Galicia',               itp: 0.10,  ajd: 0.015  },
  { value: 'castilla_leon', label: 'Castilla y León',       itp: 0.08,  ajd: 0.015  },
  { value: 'castilla_lm',   label: 'Castilla-La Mancha',    itp: 0.09,  ajd: 0.015  },
  { value: 'pais_vasco',    label: 'País Vasco',            itp: 0.04,  ajd: 0.00   },
  { value: 'navarra',       label: 'Navarra',               itp: 0.06,  ajd: 0.005  },
  { value: 'aragon',        label: 'Aragón',                itp: 0.08,  ajd: 0.015  },
  { value: 'murcia',        label: 'Murcia',                itp: 0.08,  ajd: 0.015  },
  { value: 'extremadura',   label: 'Extremadura',           itp: 0.08,  ajd: 0.015  },
  { value: 'asturias',      label: 'Asturias',              itp: 0.08,  ajd: 0.012  },
  { value: 'cantabria',     label: 'Cantabria',             itp: 0.10,  ajd: 0.015  },
  { value: 'rioja',         label: 'La Rioja',              itp: 0.07,  ajd: 0.010  },
  { value: 'baleares',      label: 'Islas Baleares',        itp: 0.08,  ajd: 0.012  },
  { value: 'canarias',      label: 'Islas Canarias',        itp: 0.065, ajd: 0.0075 },
  { value: 'ceuta',         label: 'Ceuta',                 itp: 0.06,  ajd: 0.005  },
  { value: 'melilla',       label: 'Melilla',               itp: 0.06,  ajd: 0.005  },
];

const NOTARY_RATE   = 0.004;
const REGISTRY_RATE = 0.0015;
const GESTORIA      = 450;
const TASACION      = 400;

function calcBreakdown(price, comm, newBuild) {
  const items = [];
  if (newBuild) {
    const ajdPct = comm?.ajd ?? 0.015;
    items.push({ label: 'IVA (vivienda nueva)',        pct: '10 %',                             amount: Math.round(price * 0.10) });
    items.push({ label: 'AJD (actos jurídicos)',        pct: `${+(ajdPct * 100).toFixed(2)} %`, amount: Math.round(price * ajdPct) });
  } else {
    const itpPct = comm?.itp ?? 0.06;
    items.push({ label: 'ITP (transmisión patrimonial)', pct: `${+(itpPct * 100).toFixed(1)} %`, amount: Math.round(price * itpPct) });
  }
  items.push({ label: 'Notaría (escritura)',    pct: `${(NOTARY_RATE * 100).toFixed(2)} %`,   amount: Math.round(price * NOTARY_RATE)   });
  items.push({ label: 'Registro propiedad',     pct: `${(REGISTRY_RATE * 100).toFixed(2)} %`, amount: Math.round(price * REGISTRY_RATE) });
  items.push({ label: 'Gestoría',               pct: '—',                                     amount: GESTORIA });
  items.push({ label: 'Tasación hipotecaria',   pct: '—',                                     amount: TASACION });
  return { items, total: items.reduce((s, i) => s + i.amount, 0) };
}

function pmt(principal, annualRate, years) {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate === 0) return principal / (years * 12);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const fmt = n => Math.round(n).toLocaleString('es-ES');

function Slider({ min, max, step, value, onChange, disabled }) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="mc-slider-wrap">
      <div className="mc-slider-track"
        style={{ background: disabled ? '#e5e7eb' : `linear-gradient(to right, #2563eb ${pct}%, #dbeafe ${pct}%)` }}>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange && onChange(Number(e.target.value))}
          disabled={disabled} className="mc-slider-input" />
      </div>
    </div>
  );
}

function PieChart({ loan, savings, interest, svgRef }) {
  const total = loan + savings + interest;
  if (total <= 0) return null;
  const slices = [
    { value: loan,     color: '#1e3a5f' },
    { value: savings,  color: '#93c5fd' },
    { value: interest, color: '#bfdbfe' },
  ];
  const r = 48, cx = 60, cy = 60;
  let start = -Math.PI / 2;
  const paths = slices.map(({ value, color }, i) => {
    const p = value / total;
    if (p <= 0) return null;
    const angle = p >= 0.9999 ? Math.PI * 2 - 0.001 : p * Math.PI * 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const end = start + angle;
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = angle > Math.PI ? 1 : 0;
    start = end;
    return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={color} />;
  });
  return <svg ref={svgRef} viewBox="0 0 120 120" className="mc-pie" xmlns="http://www.w3.org/2000/svg">{paths}</svg>;
}

function BreakdownTable({ items, total }) {
  return (
    <table className="mc-tax-table">
      <tbody>
        {items.map(item => (
          <tr key={item.label}>
            <td className="mc-tax-label">{item.label}</td>
            <td className="mc-tax-pct">{item.pct}</td>
            <td className="mc-tax-amt">{fmt(item.amount)} €</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td className="mc-tax-total-label" colSpan="2">Total gastos</td>
          <td className="mc-tax-total-amt">{fmt(total)} €</td>
        </tr>
      </tfoot>
    </table>
  );
}

// Genera DataURL de un SVG en memoria (sin renderizado DOM)
function buildPieSvgDataURL(loan, savings, interest) {
  return new Promise(resolve => {
    const total = loan + savings + interest;
    if (total <= 0) { resolve(null); return; }
    const slices = [
      { value: loan,     color: '#1e3a5f' },
      { value: savings,  color: '#93c5fd' },
      { value: interest, color: '#bfdbfe' },
    ];
    const r = 60, cx = 70, cy = 70;
    let start = -Math.PI / 2;
    let paths = '';
    slices.forEach(({ value, color }) => {
      const p = value / total;
      if (p <= 0) return;
      const angle = p >= 0.9999 ? Math.PI * 2 - 0.001 : p * Math.PI * 2;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const end = start + angle;
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const large = angle > Math.PI ? 1 : 0;
      paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${color}"/>`;
      start = end;
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="280" height="280">${paths}</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 280; canvas.height = 280;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#eff6ff';
      ctx.fillRect(0, 0, 280, 280);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

export default function MortgageCalculator({ agencyConfig }) {
  const [price,     setPrice]     = useState(250000);
  const [savings,   setSavings]   = useState(25000);
  const [years,     setYears]     = useState(30);
  const [rate,      setRate]      = useState(2.5);
  const [community, setCommunity] = useState('madrid');
  const [newBuild,  setNewBuild]  = useState(false);
  const [inclTax,   setInclTax]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const svgRef = useRef(null);

  const comm      = COMMUNITIES.find(c => c.value === community);
  const breakdown = useMemo(() => calcBreakdown(price, comm, newBuild), [price, comm, newBuild]);
  const taxes     = breakdown.total;

  const results = useMemo(() => {
    const base      = Math.max(0, price - savings);
    const loan      = inclTax ? base + taxes : base;
    const monthly   = pmt(loan, rate, years);
    const totalPaid = monthly * years * 12;
    const interest  = Math.max(0, totalPaid - loan);
    return { loan, monthly, interest, totalCost: price + interest + (inclTax ? 0 : taxes) };
  }, [price, savings, years, rate, taxes, inclTax]);

  const savingsPct = price > 0 ? Math.round((savings / price) * 100) : 0;
  const communityLabel = comm?.label || '';
  const estadoLabel    = newBuild ? 'Nueva construcción' : 'Segunda mano';

  const generatePDF = async () => {
    setExporting(true);
    try {
      const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
      const W    = 210;
      const navy = [30, 58, 95];
      const blue = [37, 99, 235];
      const grey = [107, 114, 128];
      const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

      // ── Cabecera ──────────────────────────────────────────────
      doc.setFillColor(...navy);
      doc.rect(0, 0, W, 30, 'F');

      let logoRight = 14;
      if (agencyConfig?.logo) {
        try {
          doc.addImage(agencyConfig.logo, 16, 5, 38, 20, undefined, 'FAST');
          logoRight = 60;
        } catch (_) {}
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(agencyConfig?.name || 'Simulación hipotecaria', logoRight, 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(180, 200, 230);
      doc.text(dateStr, W - 14, 16, { align: 'right' });

      // ── Título ────────────────────────────────────────────────
      let y = 42;
      doc.setTextColor(...navy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Simulación de hipoteca', 14, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...grey);
      doc.text(`${communityLabel}  ·  ${estadoLabel}  ·  Tipo de interés ${rate}%  ·  Plazo ${years} años`, 14, y);

      y += 6;
      doc.setDrawColor(219, 234, 254);
      doc.setLineWidth(0.4);
      doc.line(14, y, W - 14, y);

      // ── Cuota mensual destacada ────────────────────────────────
      y += 9;
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(14, y - 5, W - 28, 14, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...navy);
      doc.text('CUOTA MENSUAL ESTIMADA', 19, y + 3);
      doc.setFontSize(14);
      doc.text(`${fmt(results.monthly)} €`, W - 18, y + 4, { align: 'right' });

      // ── Resumen datos ──────────────────────────────────────────
      y += 18;
      const rows = [
        ['Importe hipoteca',         fmt(results.loan)      + ' €'],
        ['Ahorro aportado',          fmt(savings)           + ' €'],
        ['Interés total estimado',   fmt(results.interest)  + ' €'],
      ];
      rows.forEach(([label, val]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(55, 65, 81);
        doc.text(label, 19, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navy);
        doc.text(val, W - 18, y, { align: 'right' });
        y += 9;
      });

      // Coste total
      doc.setFillColor(219, 234, 254);
      doc.roundedRect(14, y - 1, W - 28, 11, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...navy);
      doc.text('Coste total con hipoteca', 19, y + 6);
      doc.setFontSize(12);
      doc.text(`${fmt(results.totalCost)} €`, W - 18, y + 6.5, { align: 'right' });

      y += 18;
      doc.setDrawColor(219, 234, 254);
      doc.line(14, y, W - 14, y);
      y += 8;

      // ── Gráfico + tabla ────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...navy);
      doc.text('Desglose de gastos de compra', 74, y + 2);

      // Pie chart
      const pieImg = await buildPieSvgDataURL(results.loan, savings, results.interest);
      if (pieImg) {
        doc.addImage(pieImg, 'PNG', 14, y, 52, 52);
        // Leyenda debajo del gráfico
        const legend = [
          { color: navy,       label: 'Hipoteca' },
          { color: [147,197,253], label: 'Ahorro' },
          { color: [191,219,254], label: 'Intereses' },
        ];
        let ly = y + 55;
        legend.forEach(({ color, label }) => {
          doc.setFillColor(...color);
          doc.roundedRect(14, ly - 2.5, 4, 4, 0.5, 0.5, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(...grey);
          doc.text(label, 20, ly + 0.5);
          ly += 6;
        });
      }

      // Tabla de gastos
      let ty = y + 10;
      breakdown.items.forEach(item => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(55, 65, 81);
        doc.text(item.label, 74, ty);
        doc.setTextColor(...grey);
        doc.text(item.pct, 160, ty, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navy);
        doc.text(`${fmt(item.amount)} €`, W - 14, ty, { align: 'right' });
        doc.setDrawColor(235, 238, 245);
        doc.setLineWidth(0.2);
        doc.line(74, ty + 2.5, W - 14, ty + 2.5);
        ty += 9;
      });

      // Total gastos
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(72, ty - 1, W - 14 - 72, 10, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...navy);
      doc.text('Total gastos', 75, ty + 6);
      doc.text(`${fmt(breakdown.total)} €`, W - 14, ty + 6, { align: 'right' });

      // ── Nota legal ─────────────────────────────────────────────
      const legalY = Math.max(y + 80, ty + 18);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, legalY, W - 28, 38, 3, 3, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(14, legalY, W - 28, 38, 3, 3, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...blue);
      doc.text('NOTA LEGAL — SIMULACIÓN ORIENTATIVA', 18, legalY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...grey);
      const legalText = [
        'Esta simulación tiene carácter meramente informativo y orientativo. No constituye oferta vinculante ni compromiso contractual de ningún',
        'tipo por parte de la inmobiliaria o de cualquier entidad financiera. Los cálculos son estimaciones basadas en los parámetros introducidos',
        'y pueden diferir de las condiciones reales aplicadas por las entidades financieras en función de la solvencia del solicitante, las garantías',
        'aportadas y la política crediticia vigente en cada momento. Los tipos impositivos (ITP, IVA, AJD) y los gastos de compraventa están',
        'sujetos a modificación según la normativa fiscal vigente y la legislación de la Comunidad Autónoma competente en materia tributaria.',
        'Se recomienda consultar con un profesional cualificado antes de tomar cualquier decisión financiera o de inversión.',
      ];
      legalText.forEach((line, i) => {
        doc.text(line, 18, legalY + 14 + i * 4.2);
      });

      // ── Pie de página ─────────────────────────────────────────
      doc.setDrawColor(219, 234, 254);
      doc.setLineWidth(0.3);
      doc.line(14, 286, W - 14, 286);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...grey);
      if (agencyConfig?.name) doc.text(agencyConfig.name, 14, 291);
      doc.text(`Generado el ${dateStr}`, W - 14, 291, { align: 'right' });

      doc.save(`simulacion-hipoteca-${new Date().toISOString().slice(0,10)}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mc-page">
      <div className="mc-wrap">

        {/* ── Formulario ── */}
        <div className="mc-form">
          <div className="mc-form-header">
            <h2 className="mc-heading">Calculadora hipoteca</h2>
            <button className="mc-pdf-btn" onClick={generatePDF} disabled={exporting}>
              <FileDown size={15}/>
              {exporting ? 'Generando…' : 'Exportar PDF'}
            </button>
          </div>

          <div className="mc-field">
            <label>Precio del inmueble</label>
            <div className="mc-input-row">
              <input type="number" value={price} min="0" max="10000000"
                onChange={e => setPrice(Math.max(0, Number(e.target.value) || 0))} />
              <span className="mc-unit">€</span>
            </div>
            <Slider min={50000} max={2000000} step={5000} value={price} onChange={setPrice} />
          </div>

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

          <div className="mc-field">
            <label>Plazo en años</label>
            <div className="mc-input-row">
              <input type="number" value={years} min="1" max="40"
                onChange={e => setYears(Math.min(40, Math.max(1, Number(e.target.value) || 1)))} />
              <span className="mc-unit">años</span>
            </div>
            <Slider min={1} max={40} step={1} value={years} onChange={setYears} />
          </div>

          <div className="mc-field">
            <label>Tipo de interés</label>
            <div className="mc-input-row">
              <input type="number" value={rate} min="0" max="15" step="0.1"
                onChange={e => setRate(Math.min(15, Math.max(0, Number(e.target.value) || 0)))} />
              <span className="mc-unit">%</span>
            </div>
            <Slider min={0} max={10} step={0.1} value={rate} onChange={setRate} />
          </div>

          <div className="mc-field">
            <label>Impuestos y gastos <span className="mc-auto">(calculado automáticamente)</span></label>
            <div className="mc-input-row">
              <input type="number" value={taxes} readOnly className="mc-readonly" />
              <span className="mc-unit">€</span>
            </div>
            <Slider min={0} max={Math.max(1, price * 0.25)} step={100} value={taxes} disabled />
          </div>

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
            Información orientativa. No constituye oferta vinculante. Impuestos e intereses son estimados.
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

          <div className="mc-chart-row">
            <PieChart loan={results.loan} savings={savings} interest={results.interest} svgRef={svgRef} />
            <BreakdownTable items={breakdown.items} total={breakdown.total} />
          </div>

          <div className="mc-total-block">
            <span>Coste total con hipoteca</span>
            <strong>{fmt(results.totalCost)} €</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
