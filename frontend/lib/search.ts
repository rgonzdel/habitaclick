import type { SupabaseClient } from '@supabase/supabase-js';

export type Filters = {
  operation?: string;
  province?: string;
  city?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  minArea?: string;
  condition?: string;
  features?: string; // separadas por coma
  q?: string;
  sort?: string;
  page?: string;
};

export const PAGE_SIZE = 20;

// Orden por defecto: Top pagado > destacado > peso del plan > recientes
export async function searchListings(sb: SupabaseClient, f: Filters) {
  let q = sb.from('listings_ranked').select('*', { count: 'exact' });
  if (f.operation) q = q.eq('operation', f.operation);
  if (f.province) q = q.eq('province', f.province);
  if (f.city) q = q.ilike('city', `%${f.city}%`);
  if (f.type) q = q.eq('property_type', f.type);
  if (f.minPrice) q = q.gte('price', Number(f.minPrice));
  if (f.maxPrice) q = q.lte('price', Number(f.maxPrice));
  if (f.bedrooms) q = q.gte('bedrooms', Number(f.bedrooms));
  if (f.bathrooms) q = q.gte('bathrooms', Number(f.bathrooms));
  if (f.minArea) q = q.gte('built_area', Number(f.minArea));
  if (f.condition) q = q.eq('condition', f.condition);
  if (f.features) q = q.contains('features', f.features.split(',').filter(Boolean));
  if (f.q) q = q.or(`title.ilike.%${f.q.replace(/[,%()]/g, ' ')}%,city.ilike.%${f.q.replace(/[,%()]/g, ' ')}%`);

  switch (f.sort) {
    case 'recientes':
      q = q.order('published_at', { ascending: false });
      break;
    case 'precio_asc':
      q = q.order('price', { ascending: true });
      break;
    case 'precio_desc':
      q = q.order('price', { ascending: false });
      break;
    default:
      q = q
        .order('is_top', { ascending: false })
        .order('is_highlight', { ascending: false })
        .order('plan_weight', { ascending: false })
        .order('published_at', { ascending: false });
  }

  const page = Math.max(1, Number(f.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  q = q.range(from, from + PAGE_SIZE - 1);
  const { data, count, error } = await q;
  return { listings: data || [], total: count || 0, page, error };
}
