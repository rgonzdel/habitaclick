import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Cliente para el navegador (con sesion persistente)
let browserClient: SupabaseClient | null = null;
export function supabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return browserClient;
}

// Cliente para componentes de servidor: solo lectura publica, sin sesion
export function supabaseServer(): SupabaseClient {
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const FUNCTIONS_URL = `${url}/functions/v1`;
