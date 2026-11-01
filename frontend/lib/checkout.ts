import { supabaseBrowser, FUNCTIONS_URL } from './supabase';

type CheckoutInput =
  | { kind: 'subscription'; plan: string }
  | { kind: 'product'; product: string; listingId: string };

// Llama a la edge function create-checkout (Stripe) y redirige a la pasarela
export async function startCheckout(input: CheckoutInput): Promise<string | null> {
  const { data } = await supabaseBrowser().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return 'Inicia sesión para continuar';
  const res = await fetch(`${FUNCTIONS_URL}/create-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...input, origin: window.location.origin }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) return body.error || 'El pago todavía no está disponible';
  window.location.href = body.url;
  return null;
}
