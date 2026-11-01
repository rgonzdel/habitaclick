# Habitaclick

Portal de anuncios inmobiliarios de venta y alquiler. Ingresos por:
publicación de anuncios de profesionales (planes), pago por anuncios adicionales de particulares
(el primero es gratis), posicionamiento (destacado y top), email marketing y publicidad.

## Estructura

- `frontend/`: web en Next.js 14 (App Router, TypeScript). Se despliega en Vercel.
- `supabase/functions/`: funciones edge para cobros y alertas.
- Base de datos y autenticación: Supabase (proyecto `habitaclick`, región eu-central-1).

## Desarrollo local

```
cd frontend
cp .env.example .env.local   # poner la clave anon del proyecto
npm install
npm run dev
```

## Modelo de negocio en base de datos

- `plans`: planes mensuales de profesionales (cupo de anuncios, peso de posicionamiento, incluye mailing).
- `products`: pagos únicos (anuncio adicional, destacado 7 días, top 7 días).
- `publish_listing(id)`: función que decide si se publica, pide pago o pide suscripción.
- `listings_ranked`: vista pública con orden por Top, destacado, plan y fecha.
- Precios de `plans` y `products` son provisionales: se editan en la propia tabla.

## Puesta en marcha de cobros (Stripe)

1. Crear cuenta de Stripe y obtener la clave secreta.
2. Secretos de las funciones edge: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ALLOWED_ORIGINS`.
3. Desplegar `create-checkout` (con JWT) y `stripe-webhook` (sin JWT, verifica firma).
4. En Stripe, apuntar el webhook a `/functions/v1/stripe-webhook` con los eventos
   `checkout.session.completed`, `customer.subscription.created|updated|deleted`.

## Alertas por email

`send-alerts` envía las búsquedas guardadas. Requiere `RESEND_API_KEY`, `ALERTS_FROM`, `CRON_SECRET`
y una tarea programada que la llame cada hora con la cabecera `x-cron-secret`.

## Pendiente

- Textos legales reales (`app/legal/[slug]`): ahora son un borrador con huecos.
- Moderación de anuncios y panel de administración (`profiles.is_admin` ya existe).
- Mapa de resultados y campañas de newsletter.
