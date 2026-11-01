export const PROVINCES = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz',
  'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba',
  'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares',
  'Jaén', 'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Murcia',
  'Navarra', 'Ourense', 'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife',
  'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid',
  'Vizcaya', 'Zamora', 'Zaragoza', 'Ceuta', 'Melilla',
];

export const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: 'piso', label: 'Piso' },
  { value: 'casa', label: 'Casa' },
  { value: 'chalet', label: 'Chalet' },
  { value: 'atico', label: 'Ático' },
  { value: 'duplex', label: 'Dúplex' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'local', label: 'Local' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'garaje', label: 'Garaje' },
  { value: 'trastero', label: 'Trastero' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'nave', label: 'Nave' },
];

export const FEATURES = [
  'Ascensor', 'Terraza', 'Balcón', 'Garaje', 'Piscina', 'Jardín', 'Aire acondicionado',
  'Calefacción', 'Amueblado', 'Armarios empotrados', 'Trastero', 'Accesible', 'Mascotas permitidas',
];

export const CONDITIONS = [
  { value: 'obra_nueva', label: 'Obra nueva' },
  { value: 'buen_estado', label: 'Buen estado' },
  { value: 'a_reformar', label: 'A reformar' },
];

export const SORTS = [
  { value: 'relevancia', label: 'Más relevantes' },
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
];

export const typeLabel = (v: string) => PROPERTY_TYPES.find((t) => t.value === v)?.label || v;
