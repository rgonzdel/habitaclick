'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export default function FavoriteButton({ listingId }: { listingId: string }) {
  const { session } = useAuth();
  const router = useRouter();
  const [fav, setFav] = useState(false);
  const sb = supabaseBrowser();

  useEffect(() => {
    if (!session) return setFav(false);
    sb.from('favorites')
      .select('listing_id')
      .eq('listing_id', listingId)
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setFav(!!data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, listingId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return router.push('/acceso?next=' + encodeURIComponent(window.location.pathname + window.location.search));
    if (fav) {
      setFav(false);
      await sb.from('favorites').delete().eq('listing_id', listingId).eq('user_id', session.user.id);
    } else {
      setFav(true);
      await sb.from('favorites').insert({ listing_id: listingId, user_id: session.user.id });
    }
  }

  return (
    <button className={`fav ${fav ? 'fav-on' : ''}`} key={fav ? 'on' : 'off'} onClick={toggle} aria-label={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
      {fav ? '♥' : '♡'}
    </button>
  );
}
