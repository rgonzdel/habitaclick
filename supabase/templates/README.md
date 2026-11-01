# Correos de autenticación de Habitaclick

Plantillas en español con la marca. Se pegan en Supabase: Authentication > Emails (o Email Templates).

| Plantilla | Archivo | Asunto sugerido |
|---|---|---|
| Confirm sign up | `confirmation.html` | Confirma tu correo en Habitaclick |
| Reset password | `recovery.html` | Restablece tu contraseña de Habitaclick |
| Magic link | `magic_link.html` | Tu enlace de acceso a Habitaclick |
| Change email | `email_change.html` | Confirma tu nuevo correo en Habitaclick |
| Invite user | `invite.html` | Te han invitado a Habitaclick |
| Reauthentication | `reauthentication.html` | Tu código de verificación de Habitaclick |

## Remitente propio y entregabilidad

El remitente por defecto ("Supabase Auth") es limitado y no es de producción. Configura SMTP propio en
Authentication > Emails > SMTP Settings, por ejemplo con Resend y el dominio habitaclick.es
(registros SPF, DKIM y DMARC), con remitente `Habitaclick <no-responder@habitaclick.es>`.

Además, en Authentication > URL Configuration pon `https://habitaclick.es` como Site URL y como redirect.
