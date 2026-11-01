'use client';

import { useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

export default function ViewCounter({ id }: { id: string }) {
  useEffect(() => {
    const key = `seen:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {}
    supabaseBrowser().rpc('increment_views', { p_listing: id });
  }, [id]);
  return null;
}
