import { supabaseServer } from '@/lib/supabase';

export default async function AdSlot({ placement }: { placement: 'home_banner' | 'search_sidebar' | 'search_inline' | 'listing_sidebar' }) {
  const sb = supabaseServer();
  const { data } = await sb.from('ad_slots').select('id, advertiser, image_url, target_url').eq('placement', placement).limit(5);
  if (!data || data.length === 0) return null;
  const ad = data[Math.floor(Math.random() * data.length)];
  return (
    <a className={`ad ad-${placement}`} href={ad.target_url} target="_blank" rel="sponsored noopener noreferrer">
      <span className="ad-tag">Publicidad</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ad.image_url} alt={ad.advertiser} loading="lazy" />
    </a>
  );
}
