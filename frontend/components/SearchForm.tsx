import { PROVINCES, PROPERTY_TYPES, CONDITIONS, FEATURES, SORTS } from '@/lib/constants';
import type { Filters } from '@/lib/search';

// Formulario GET: funciona sin JavaScript y mantiene las URLs indexables
export function HeroSearch({ operation = 'venta' }: { operation?: string }) {
  return (
    <form action="/buscar" method="get" className="hero-search">
      <div className="tabs">
        <label>
          <input type="radio" name="operation" value="venta" defaultChecked={operation === 'venta'} /> <span>Comprar</span>
        </label>
        <label>
          <input type="radio" name="operation" value="alquiler" defaultChecked={operation === 'alquiler'} /> <span>Alquilar</span>
        </label>
      </div>
      <div className="hero-fields">
        <select name="province" defaultValue="">
          <option value="">Toda España</option>
          {PROVINCES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select name="type" defaultValue="">
          <option value="">Cualquier tipo</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input name="q" placeholder="Población, barrio o palabra clave" />
        <button className="btn btn-accent" type="submit">
          Buscar
        </button>
      </div>
    </form>
  );
}

export function FilterPanel({ f }: { f: Filters }) {
  const selFeatures = (f.features || '').split(',').filter(Boolean);
  return (
    <form action="/buscar" method="get" className="filters">
      <div className="tabs tabs-sm">
        <label>
          <input type="radio" name="operation" value="venta" defaultChecked={(f.operation || 'venta') === 'venta'} /> <span>Comprar</span>
        </label>
        <label>
          <input type="radio" name="operation" value="alquiler" defaultChecked={f.operation === 'alquiler'} /> <span>Alquilar</span>
        </label>
      </div>

      <label className="field">
        Provincia
        <select name="province" defaultValue={f.province || ''}>
          <option value="">Toda España</option>
          {PROVINCES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Población
        <input name="city" defaultValue={f.city || ''} placeholder="Ej. Toledo" />
      </label>
      <label className="field">
        Tipo
        <select name="type" defaultValue={f.type || ''}>
          <option value="">Cualquiera</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <div className="field-row">
        <label className="field">
          Precio mín.
          <input name="minPrice" type="number" min="0" defaultValue={f.minPrice || ''} />
        </label>
        <label className="field">
          Precio máx.
          <input name="maxPrice" type="number" min="0" defaultValue={f.maxPrice || ''} />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          Habitaciones (mín.)
          <select name="bedrooms" defaultValue={f.bedrooms || ''}>
            <option value="">Todas</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Baños (mín.)
          <select name="bathrooms" defaultValue={f.bathrooms || ''}>
            <option value="">Todos</option>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        Superficie mínima (m²)
        <input name="minArea" type="number" min="0" defaultValue={f.minArea || ''} />
      </label>
      <label className="field">
        Estado
        <select name="condition" defaultValue={f.condition || ''}>
          <option value="">Cualquiera</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="field">
        <legend>Características</legend>
        <FeatureChecks selected={selFeatures} />
      </fieldset>
      <label className="field">
        Ordenar por
        <select name="sort" defaultValue={f.sort || 'relevancia'}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-primary btn-block" type="submit">
        Aplicar filtros
      </button>
    </form>
  );
}

// Varias casillas se unen en un solo parametro "features" con un pequeño script inline
function FeatureChecks({ selected }: { selected: string[] }) {
  return (
    <>
      <input type="hidden" name="features" id="features-hidden" defaultValue={selected.join(',')} />
      <div className="checks">
        {FEATURES.map((ft) => (
          <label key={ft} className="check">
            <input type="checkbox" data-feature defaultChecked={selected.includes(ft)} value={ft} /> {ft}
          </label>
        ))}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var h=document.getElementById('features-hidden');if(!h)return;var f=h.form;if(!f)return;f.addEventListener('submit',function(){var v=[].slice.call(f.querySelectorAll('input[data-feature]:checked')).map(function(i){return i.value});h.value=v.join(',');});})();`,
        }}
      />
    </>
  );
}
