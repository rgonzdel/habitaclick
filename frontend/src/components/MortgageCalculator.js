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
    items.push({ label: 'IVA (vivienda nueva)',         pct: '10 %',                             amount: Math.round(price * 0.10) });
    items.push({ label: 'AJD (actos jurídicos)',         pct: `${+(ajdPct * 100).toFixed(2)} %`, amount: Math.round(price * ajdPct) });
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

function getImageNaturalSize(src) {
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 1, h: 1 });
    img.src = src;
  });
}

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
      ctx.fillStyle = '#ffffff';
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

  const savingsPct     = price > 0 ? Math.round((savings / price) * 100) : 0;
  const communityLabel = comm?.label || '';
  const estadoLabel    = newBuild ? 'Nueva construcción' : 'Segunda mano';

  const generatePDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = 210, M = 14, CW = W - 2 * M;
      const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

      // Paleta de colores
      const navy    = [0, 51, 102];
      const navyMid = [30, 58, 95];
      const blue    = [37, 99, 235];
      const blueP   = [239, 246, 255];
      const blueB   = [191, 219, 254];
      const textM   = [55, 65, 81];
      const textG   = [107, 114, 128];
      const bgL     = [249, 250, 251];
      const white   = [255, 255, 255];

      // ══ CABECERA ════════════════════════════════════════════════
      // Franja azul eléctrico superior (acento)
      doc.setFillColor(...blue);
      doc.rect(0, 0, W, 3, 'F');
      // Bloque navy
      doc.setFillColor(...navy);
      doc.rect(0, 3, W, 38, 'F');

      // Logo (si existe) — escala proporcional, sin deformar
      let nameX = M;
      if (agencyConfig?.logo) {
        try {
          const { w, h } = await getImageNaturalSize(agencyConfig.logo);
          const maxW = 44, maxH = 26;
          const ratio = Math.min(maxW / w, maxH / h);
          const logoW = w * ratio;
          const logoH = h * ratio;
          const logoY = 3 + (38 - logoH) / 2; // centrado vertical en la cabecera
          doc.addImage(agencyConfig.logo, M, logoY, logoW, logoH, undefined, 'FAST');
          nameX = M + logoW + 5;
        } catch (_) {}
      }

      // Nombre de la inmobiliaria
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(...white);
      doc.text(agencyConfig?.name || 'Simulación Hipotecaria', nameX, 19);

      // Subtítulo y parámetros
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(147, 197, 253);
      doc.text('Simulación de hipoteca personalizada', nameX, 27);
      doc.text(`${communityLabel}  ·  ${estadoLabel}`, nameX, 33);

      // Fecha y parámetros principales (derecha)
      doc.setFontSize(8);
      doc.setTextColor(180, 210, 240);
      doc.text(dateStr, W - M, 19, { align: 'right' });
      doc.setFontSize(7.5);
      doc.text(`Tipo de interés ${rate.toFixed(1)}%  ·  Plazo ${years} años`, W - M, 27, { align: 'right' });

      let y = 52;

      // ══ BLOQUE A: CUOTA MENSUAL (izq) + PARÁMETROS (dcha) ══════
      const cardH = 62;
      const c1W   = 84;
      const c2X   = M + c1W + 6;
      const c2W   = CW - c1W - 6;

      // — Tarjeta azul: cuota mensual —
      doc.setFillColor(...blue);
      doc.roundedRect(M, y, c1W, cardH, 4, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(180, 215, 255);
      doc.text('CUOTA MENSUAL ESTIMADA', M + 7, y + 12);

      doc.setFontSize(28);
      doc.setTextColor(...white);
      doc.text(`${fmt(results.monthly)}`, M + 7, y + 30);

      doc.setFontSize(12);
      doc.setTextColor(200, 225, 255);
      doc.text('€ / mes', M + 7, y + 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(160, 200, 240);
      doc.text('Cuota fija durante todo el plazo', M + 7, y + 50);

      // — Tarjeta gris: parámetros —
      doc.setFillColor(...bgL);
      doc.roundedRect(c2X, y, c2W, cardH, 4, 4, 'F');
      doc.setDrawColor(...blueB);
      doc.setLineWidth(0.3);
      doc.roundedRect(c2X, y, c2W, cardH, 4, 4, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...navyMid);
      doc.text('PARÁMETROS DE LA SIMULACIÓN', c2X + 7, y + 11);

      const params = [
        ['Precio del inmueble',  `${fmt(price)} €`],
        ['Ahorro / entrada',     `${fmt(savings)} € (${savingsPct}%)`],
        ['Importe hipoteca',     `${fmt(results.loan)} €`],
        ['Plazo',                `${years} años`],
        ['Tipo de interés',      `${rate.toFixed(1)} %`],
        ['Comunidad Autónoma',   communityLabel],
      ];
      const paramPad  = 8;
      const labelColW = 38; // ancho fijo columna etiqueta
      const valX      = c2X + c2W - paramPad;
      const valMaxW   = c2W - paramPad - labelColW - paramPad;

      let py = y + 20;
      params.forEach(([lbl, val]) => {
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.2);
        doc.line(c2X + paramPad, py - 3.5, c2X + c2W - paramPad, py - 3.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...textG);
        doc.text(lbl, c2X + paramPad, py);

        // Auto-fit font si el valor es demasiado largo
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navyMid);
        let vSize = 7.8;
        doc.setFontSize(vSize);
        while (doc.getTextWidth(val) > valMaxW && vSize > 5.5) {
          vSize -= 0.2;
          doc.setFontSize(vSize);
        }
        doc.text(val, valX, py, { align: 'right' });
        py += 7.8;
      });

      y += cardH + 9;

      // ══ BLOQUE B: TRES TARJETAS RESUMEN ════════════════════════
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...navyMid);
      doc.text('RESUMEN FINANCIERO', M, y + 1);
      doc.setDrawColor(...blueB);
      doc.setLineWidth(0.4);
      doc.line(M + 53, y - 0.5, W - M, y - 0.5);

      y += 6;
      const summW = (CW - 8) / 3;
      const summH = 27;
      const summCards = [
        { lbl: 'Importe hipoteca',       val: `${fmt(results.loan)} €`,      bar: navyMid,      barC: navyMid },
        { lbl: 'Interés total estimado', val: `${fmt(results.interest)} €`,  bar: [8, 92, 186], barC: [8, 92, 186] },
        { lbl: 'Coste total hipoteca',   val: `${fmt(results.totalCost)} €`, bar: navy,          barC: navy },
      ];
      summCards.forEach((card, i) => {
        const sx = M + i * (summW + 4);
        doc.setFillColor(...blueP);
        doc.roundedRect(sx, y, summW, summH, 3, 3, 'F');
        doc.setDrawColor(...blueB);
        doc.setLineWidth(0.3);
        doc.roundedRect(sx, y, summW, summH, 3, 3, 'S');

        // Barra fina vertical redondeada (1.5mm) — elegante, no un rect macizo
        doc.setFillColor(...card.bar);
        doc.roundedRect(sx + 2, y + 4, 1.5, summH - 8, 0.75, 0.75, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...textG);
        doc.text(card.lbl, sx + 7, y + 10);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...card.barC);
        doc.text(card.val, sx + 7, y + 22);
      });

      y += summH + 10;

      // ══ BLOQUE C: GRÁFICO DE TARTA + TABLA DE GASTOS ══════════
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...navyMid);
      doc.text('DESGLOSE DE GASTOS DE COMPRA', M, y + 1);
      doc.setDrawColor(...blueB);
      doc.setLineWidth(0.4);
      doc.line(M + 72, y - 0.5, W - M, y - 0.5);

      y += 6;
      const pieSize = 48;
      const tableX  = M + pieSize + 12;
      const tableW  = CW - pieSize - 12;

      // Gráfico de tarta
      const pieImg = await buildPieSvgDataURL(results.loan, savings, results.interest);
      if (pieImg) {
        doc.addImage(pieImg, 'PNG', M, y, pieSize, pieSize);
      }
      // Leyenda debajo del gráfico
      const legend = [
        { color: navyMid,       lbl: 'Préstamo',  val: `${fmt(results.loan)} €` },
        { color: [147,197,253], lbl: 'Ahorro',    val: `${fmt(savings)} €` },
        { color: [191,219,254], lbl: 'Intereses', val: `${fmt(results.interest)} €` },
      ];
      let ly = y + pieSize + 5;
      legend.forEach(({ color, lbl, val }) => {
        doc.setFillColor(...color);
        doc.roundedRect(M, ly - 2.5, 3.5, 3.5, 0.5, 0.5, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...textG);
        doc.text(lbl, M + 6, ly + 0.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navyMid);
        doc.text(val, M + 21, ly + 0.5);
        ly += 5.5;
      });

      // Cabecera de la tabla
      doc.setFillColor(...navyMid);
      doc.roundedRect(tableX, y, tableW, 8, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...white);
      doc.text('Concepto', tableX + 4, y + 5.5);
      doc.text('Tipo', tableX + tableW - 26, y + 5.5, { align: 'right' });
      doc.text('Importe', tableX + tableW - 4, y + 5.5, { align: 'right' });

      // Filas de la tabla (alternadas)
      let ty = y + 8;
      const rowH = 7.5;
      breakdown.items.forEach((item, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(tableX, ty, tableW, rowH, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...textM);
        doc.text(item.label, tableX + 4, ty + 5.2);
        doc.setTextColor(...textG);
        doc.text(item.pct, tableX + tableW - 26, ty + 5.2, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navyMid);
        doc.text(`${fmt(item.amount)} €`, tableX + tableW - 4, ty + 5.2, { align: 'right' });
        ty += rowH;
      });

      // Fila total gastos
      doc.setFillColor(...blueP);
      doc.roundedRect(tableX, ty, tableW, 10, 2, 2, 'F');
      doc.setDrawColor(...blueB);
      doc.setLineWidth(0.3);
      doc.roundedRect(tableX, ty, tableW, 10, 2, 2, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...navy);
      doc.text('TOTAL GASTOS', tableX + 4, ty + 7);
      doc.text(`${fmt(breakdown.total)} €`, tableX + tableW - 4, ty + 7, { align: 'right' });
      ty += 10;

      // ══ NOTA LEGAL ══════════════════════════════════════════════
      const legalY = Math.max(y + 82, ty + 10);
      const legalH = 38;

      // Fondo gris + barra izquierda azul
      doc.setFillColor(...bgL);
      doc.roundedRect(M, legalY, CW, legalH, 3, 3, 'F');
      doc.setFillColor(...blue);
      doc.rect(M, legalY + 3.5, 3.5, legalH - 7, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...blue);
      doc.text('NOTA LEGAL — CARÁCTER ORIENTATIVO', M + 8, legalY + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...textG);
      const legalLines = doc.splitTextToSize(
        'Esta simulación tiene carácter meramente informativo y orientativo. No constituye oferta vinculante ni compromiso contractual de ningún tipo por parte de la inmobiliaria o de cualquier entidad financiera. Los cálculos son estimaciones basadas en los parámetros introducidos y pueden diferir de las condiciones reales aplicadas por las entidades financieras en función de la solvencia del solicitante y la política crediticia vigente en cada momento. Los tipos impositivos (ITP, IVA, AJD) y los gastos asociados a la compraventa están sujetos a modificación según la normativa fiscal vigente y la legislación de la Comunidad Autónoma competente en materia tributaria. Se recomienda consultar con un profesional cualificado antes de tomar cualquier decisión financiera o de inversión.',
        CW - 16
      );
      doc.text(legalLines, M + 8, legalY + 16);

      // ══ FOOTER ══════════════════════════════════════════════════
      doc.setFillColor(...navy);
      doc.rect(0, 284, W, 13, 'F');
      doc.setFillColor(...blue);
      doc.rect(0, 284, W, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(147, 197, 253);
      if (agencyConfig?.name) doc.text(agencyConfig.name, M, 292);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 210, 240);
      doc.text(`Generado el ${dateStr}`, W - M, 292, { align: 'right' });

      doc.save(`simulacion-hipoteca-${new Date().toISOString().slice(0, 10)}.pdf`);
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

        {/* ── Panel de resultados ── */}
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
