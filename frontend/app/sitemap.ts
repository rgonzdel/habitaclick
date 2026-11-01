import type { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabase';
import { SITE_URL } from '@/lib/format';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await supabaseServer()
    .from('listings_ranked')
    .select('id, updated_at')
    .order('published_at', { ascending: false })
    .limit(5000);
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/buscar?operation=venta`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/buscar?operation=alquiler`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/profesionales`, changeFrequency: 'monthly', priority: 0.5 },
  ];
  return [
    ...base,
    ...(data || []).map((l: any) => ({ url: `${SITE_URL}/inmueble/${l.id}`, lastModified: l.updated_at, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
