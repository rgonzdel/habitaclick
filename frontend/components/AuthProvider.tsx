'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase';

export type Profile = {
  id: string;
  account_type: 'particular' | 'profesional';
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  is_admin: boolean;
  free_ad_used: boolean;
  marketing_opt_in: boolean;
};

type Ctx = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const sb = supabaseBrowser();

  async function loadProfile(s: Session | null) {
    if (!s) {
      setProfile(null);
      return;
    }
    const { data } = await sb.from('profiles').select('*').eq('id', s.user.id).single();
    setProfile((data as Profile) || null);
  }

  useEffect(() => {
    sb.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // Evita llamadas a Supabase dentro del propio callback
      setTimeout(() => loadProfile(s), 0);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        session,
        profile,
        loading,
        refreshProfile: () => loadProfile(session),
        signOut: async () => {
          await sb.auth.signOut();
          setProfile(null);
        },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
