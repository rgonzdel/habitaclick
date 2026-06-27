const pick = arr => arr[Math.floor(Math.random() * arr.length)];

const TYPE_NOUN = {
  apartment: ['apartamento', 'piso', 'vivienda'],
  house:     ['casa', 'chalet', 'vivienda unifamiliar'],
  land:      ['parcela', 'terreno', 'solar'],
  commercial:['local comercial', 'local', 'espacio comercial'],
};

const OPENINGS_SALE = [
  (noun, loc) => `Oportunidad única de adquirir ${agregarArticulo(noun)}${loc ? ` en ${loc}` : ''}.`,
  (noun, loc) => `Te presentamos ${agregarArticulo(noun)} excepcional${loc ? `, ubicado en ${loc}` : ''}.`,
  (noun, loc) => `Magnífico${agregarArticulo(noun, false)}${loc ? ` situado en ${loc}` : ''}.`,
  (noun, loc) => `Descubre ${agregarArticulo(noun)} ideal${loc ? ` en pleno corazón de ${loc}` : ''}.`,
];

const OPENINGS_RENT = [
  (noun, loc) => `Se alquila ${agregarArticulo(noun)} en perfectas condiciones${loc ? `, en ${loc}` : ''}.`,
  (noun, loc) => `Disponible para alquiler: ${agregarArticulo(noun)} luminoso y bien comunicado${loc ? ` en ${loc}` : ''}.`,
  (noun, loc) => `Estupendo${agregarArticulo(noun, false)} en alquiler${loc ? ` en ${loc}` : ''}.`,
];

function agregarArticulo(noun, withArticle = true) {
  if (!withArticle) return ` ${noun}`;
  const vowels = /^[aeiouáéíóú]/i;
  const isVowel = vowels.test(noun);
  if (['apartamento','piso','chalet','solar','local','espacio comercial','local comercial'].includes(noun)) {
    return `un ${noun}`;
  }
  if (['casa','vivienda','parcela','vivienda unifamiliar'].includes(noun)) {
    return isVowel ? `una ${noun}` : `una ${noun}`;
  }
  return `un ${noun}`;
}

const SIZE_PHRASES = m2 => pick([
  `Con una superficie de ${m2} m², `,
  `Sus ${m2} m² de superficie ofrecen `,
  `Dispone de ${m2} m² distribuidos `,
  `Con ${m2} m² bien aprovechados, `,
]);

const ROOM_PHRASES = (beds, baths) => {
  const parts = [];
  if (beds) parts.push(`${beds} dormitorio${beds > 1 ? 's' : ''}`);
  if (baths) parts.push(`${baths} baño${baths > 1 ? 's' : ''}`);
  if (!parts.length) return '';
  return `Cuenta con ${parts.join(' y ')}, `;
};

const LOCATION_EXTRA = loc => loc ? pick([
  `La ubicación en ${loc} garantiza acceso cómodo a todos los servicios.`,
  `Su emplazamiento en ${loc} combina tranquilidad y conectividad.`,
  `Situado en ${loc}, disfrutarás de una zona con todos los servicios a tu alcance.`,
  `${loc} es una zona muy demandada por su calidad de vida y excelentes comunicaciones.`,
]) : '';

const CLOSINGS_SALE = [
  'No pierdas la ocasión de hacer tuyo este inmueble.',
  'Una oportunidad que no querrás dejar escapar.',
  'Ideal para quienes buscan calidad y confort.',
  'Contáctanos para concertar una visita sin compromiso.',
  '¡Visítalo y enamórate!',
];

const CLOSINGS_RENT = [
  'Disponible para entrar a vivir. ¡Llámanos!',
  'Contacta con nosotros para más información y visitas.',
  'No esperes más, es exactamente lo que buscabas.',
  'Infórmate ahora y reserva tu visita.',
];

const LAND_PHRASES = m2 => pick([
  `Parcela de ${m2} m² con grandes posibilidades de edificación.`,
  `Terreno de ${m2} m² en zona con buena accesibilidad.`,
  `Solar de ${m2} m² listo para desarrollar tu proyecto.`,
]);

const COMMERCIAL_PHRASES = m2 => pick([
  `Local de ${m2 ? m2 + ' m² ' : ''}ideal para cualquier tipo de negocio.`,
  `Espacio comercial${m2 ? ` de ${m2} m²` : ''} con gran visibilidad y buena ubicación.`,
  `Local acondicionado${m2 ? ` de ${m2} m²` : ''}, perfecto para oficina, tienda o consulta.`,
]);

export function generateDescription({ title, price, city, province, property_type, transaction_type, bedrooms, bathrooms, square_meters }) {
  const noun = pick(TYPE_NOUN[property_type] || TYPE_NOUN.apartment);
  const loc = [city, province].filter(Boolean).join(', ');
  const isSale = transaction_type !== 'rent';
  const m2 = square_meters ? parseInt(square_meters) : null;
  const beds = bedrooms ? parseInt(bedrooms) : null;
  const baths = bathrooms ? parseInt(bathrooms) : null;
  const priceStr = price ? `${Number(price).toLocaleString('es-ES')} €` : null;

  const sentences = [];

  // Apertura
  const openings = isSale ? OPENINGS_SALE : OPENINGS_RENT;
  sentences.push(pick(openings)(noun, loc));

  // Cuerpo según tipo
  if (property_type === 'land') {
    sentences.push(LAND_PHRASES(m2));
    if (loc) sentences.push(LOCATION_EXTRA(loc));
  } else if (property_type === 'commercial') {
    sentences.push(COMMERCIAL_PHRASES(m2));
    if (loc) sentences.push(LOCATION_EXTRA(loc));
  } else {
    // Superficie + distribución
    if (m2 && (beds || baths)) {
      sentences.push(SIZE_PHRASES(m2) + ROOM_PHRASES(beds, baths).toLowerCase().replace(/^cuenta con /, '') + pick([
        'crea un ambiente perfecto para vivir.',
        'proporciona un espacio cómodo y funcional.',
        'ofrece toda la comodidad que necesitas.',
      ]));
    } else if (m2) {
      sentences.push(SIZE_PHRASES(m2) + pick([
        'el espacio se distribuye de forma inteligente y luminosa.',
        'cada rincón está pensado para aprovechar al máximo la vivienda.',
        'dispones de todo el espacio que necesitas.',
      ]));
    } else if (beds || baths) {
      sentences.push(ROOM_PHRASES(beds, baths) + pick([
        'perfectamente distribuido para el día a día.',
        'con una distribución cómoda y práctica.',
        'diseñado para adaptarse a las necesidades de tu familia.',
      ]));
    }

    if (loc) sentences.push(LOCATION_EXTRA(loc));
  }

  // Precio
  if (priceStr) {
    sentences.push(pick([
      `Precio: ${priceStr}.`,
      `Se ofrece a ${priceStr}.`,
      `Todo esto a un precio de ${priceStr}.`,
    ]));
  }

  // Cierre
  sentences.push(pick(isSale ? CLOSINGS_SALE : CLOSINGS_RENT));

  return sentences.filter(Boolean).join(' ');
}
