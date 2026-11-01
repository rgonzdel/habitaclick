export const eur = (n: number | string | null | undefined) =>
  n === null || n === undefined
    ? ''
    : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(n));

export const eurCents = (cents: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: cents % 100 ? 2 : 0 }).format(
    cents / 100
  );

export const priceLabel = (l: { price: number | string; operation: string }) =>
  l.operation === 'alquiler' ? `${eur(l.price)}/mes` : eur(l.price);

export const dateEs = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://habitaclick.es';
