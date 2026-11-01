// Send Email Hook de Supabase Auth: envia los correos de autenticacion con las plantillas de Habitaclick
// desde el buzon propio (SMTP). Desplegar con verify_jwt = false (la peticion se valida por firma).
// Secretos: SMTP_USER, SMTP_PASS, SEND_EMAIL_HOOK_SECRET. Opcionales: SMTP_HOST, SMTP_PORT, SMTP_FROM, SITE_URL.
import nodemailer from 'npm:nodemailer@6.9.16';

const NAVY = '#003366';
const GREEN = '#2ECC71';
const BASE = Deno.env.get('SITE_URL') || 'https://habitaclick.es';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

type Kind = 'confirmation' | 'recovery' | 'magic_link' | 'invite' | 'code';
const TPL: Record<Kind, { icon: string; subject: string; title: string; text: (email: string) => string; button: string; notice: string; pre: string }> = {
  confirmation: {
    icon: 'confirm',
    subject: 'Confirma tu correo en Habitaclick',
    title: 'Confirma tu correo',
    text: (e) => `Gracias por crear tu cuenta en Habitaclick. Confirma que <b>${esc(e)}</b> es tuyo para empezar a publicar anuncios, guardar favoritos y crear alertas.`,
    button: 'Confirmar mi correo',
    notice: 'Si no has creado una cuenta en Habitaclick, ignora este mensaje: no se activará nada.',
    pre: 'Confirma tu correo para activar tu cuenta de Habitaclick.',
  },
  recovery: {
    icon: 'recovery',
    subject: 'Restablece tu contraseña de Habitaclick',
    title: 'Restablece tu contraseña',
    text: () => 'Hemos recibido una solicitud para cambiar la contraseña de tu cuenta de Habitaclick. Pulsa el botón para elegir una nueva.',
    button: 'Cambiar mi contraseña',
    notice: 'Si no lo has pedido tú, ignora este mensaje: tu contraseña actual seguirá funcionando y no cambiará nada.',
    pre: 'Elige una nueva contraseña para tu cuenta de Habitaclick.',
  },
  magic_link: {
    icon: 'magic',
    subject: 'Tu enlace de acceso a Habitaclick',
    title: 'Tu enlace de acceso',
    text: () => 'Pulsa el botón para entrar en tu cuenta de Habitaclick sin escribir la contraseña. El enlace solo se puede usar una vez.',
    button: 'Entrar en Habitaclick',
    notice: 'Si no has solicitado este acceso, ignora este mensaje y no compartas el enlace con nadie.',
    pre: 'Tu enlace para entrar en Habitaclick.',
  },
  invite: {
    icon: 'invite',
    subject: 'Te han invitado a Habitaclick',
    title: 'Te han invitado a Habitaclick',
    text: () => 'Te han invitado a unirte a Habitaclick, el portal de anuncios inmobiliarios. Acepta la invitación para crear tu cuenta.',
    button: 'Aceptar invitación',
    notice: 'Si no esperabas esta invitación, puedes ignorarla sin más.',
    pre: 'Acepta tu invitación a Habitaclick.',
  },
  code: {
    icon: 'shield',
    subject: 'Tu código de verificación de Habitaclick',
    title: 'Código de verificación',
    text: () => '',
    button: '',
    notice: '',
    pre: 'Tu código de verificación de Habitaclick.',
  },
};

function shell(icon: string, title: string, body: string, pre: string) {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#1c2733;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${pre}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dfe5ec;">
<tr><td bgcolor="${NAVY}" style="background:${NAVY};padding:24px 32px;"><a href="${BASE}" style="text-decoration:none;"><img src="${BASE}/brand/logo-email.png" alt="Habitaclick" height="30" style="display:block;border:0;height:30px;width:auto;color:#ffffff;font-size:22px;font-weight:bold;"></a></td></tr>
<tr><td bgcolor="${GREEN}" height="4" style="background:${GREEN};height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td align="center" style="padding:36px 32px 8px;">
<img src="${BASE}/brand/email-${icon}.png" alt="" width="64" height="64" style="display:block;border:0;width:64px;height:64px;border-radius:32px;background:#E9F7F0;">
<h1 style="margin:20px 0 12px;font-size:26px;line-height:1.25;color:${NAVY};font-weight:800;">${title}</h1>
${body}
</td></tr>
<tr><td style="padding:8px 32px 30px;"></td></tr>
<tr><td bgcolor="#f7f9fb" style="background:#f7f9fb;border-top:1px solid #e6ebf0;padding:22px 32px;text-align:center;font-size:12px;line-height:1.6;color:#8393a3;">
<a href="${BASE}" style="color:#5c6e80;text-decoration:none;">habitaclick.es</a> &nbsp;·&nbsp; <a href="${BASE}/legal/privacidad" style="color:#5c6e80;text-decoration:none;">Privacidad</a> &nbsp;·&nbsp; <a href="${BASE}/legal/aviso-legal" style="color:#5c6e80;text-decoration:none;">Aviso legal</a><br>
Correo automático de Habitaclick, el portal de anuncios inmobiliarios.
</td></tr></table></td></tr></table></body></html>`;
}

function linkBody(text: string, button: string, notice: string, url: string) {
  return `<p style="margin:0 0 26px;font-size:16px;line-height:1.6;color:#3b4a5a;max-width:440px;">${text}</p>
<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td align="center" bgcolor="${GREEN}" style="background:${GREEN};border-radius:10px;"><a href="${url}" style="display:inline-block;padding:15px 36px;font-size:16px;font-weight:700;color:#0b2b18;text-decoration:none;border-radius:10px;">${button}</a></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td style="background:#f3f6f9;border-radius:10px;padding:14px 16px;font-size:12px;line-height:1.6;color:#667585;text-align:left;">Si el botón no funciona, copia este enlace en tu navegador:<br><a href="${url}" style="color:${NAVY};word-break:break-all;">${url}</a></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;"><tr><td style="border-left:3px solid ${GREEN};padding:4px 0 4px 14px;font-size:13px;line-height:1.6;color:#667585;text-align:left;">${notice}</td></tr></table>`;
}

function codeBody(token: string) {
  return `<p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#3b4a5a;max-width:440px;">Introduce este código para confirmar la acción en tu cuenta de Habitaclick:</p>
<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td align="center" style="background:#f3f6f9;border:2px dashed #c9d4df;border-radius:12px;padding:16px 30px;font-size:34px;font-weight:800;letter-spacing:10px;color:${NAVY};font-family:'Courier New',monospace;">${esc(token)}</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td style="border-left:3px solid ${GREEN};padding:4px 0 4px 14px;font-size:13px;line-height:1.6;color:#667585;text-align:left;">Si no has pedido este código, ignora este mensaje y no lo compartas con nadie. Habitaclick nunca te lo pedirá por teléfono ni por mensaje.</td></tr></table>`;
}

// Firma "standard webhooks" que usa Supabase Auth para los hooks
async function verify(payload: string, headers: Headers, secret: string) {
  const id = headers.get('webhook-id');
  const ts = headers.get('webhook-timestamp');
  const sig = headers.get('webhook-signature');
  if (!id || !ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const b64 = secret.replace(/^v1,whsec_/, '').replace(/^whsec_/, '');
  const keyBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${ts}.${payload}`)));
  const expected = btoa(String.fromCharCode(...mac));
  return sig.split(' ').some((part) => {
    const [v, val] = part.split(',');
    if (v !== 'v1' || !val || val.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < val.length; i++) diff |= val.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  });
}

const fail = (status: number, message: string) =>
  new Response(JSON.stringify({ error: { http_code: status, message } }), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const secret = Deno.env.get('SEND_EMAIL_HOOK_SECRET');
  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPass = Deno.env.get('SMTP_PASS');
  if (!secret || !smtpUser || !smtpPass) return fail(503, 'Correo no configurado');

  const payload = await req.text();
  if (!(await verify(payload, req.headers, secret))) return fail(401, 'Firma no válida');

  let data: any;
  try {
    data = JSON.parse(payload);
  } catch {
    return fail(400, 'Petición no válida');
  }
  const user = data.user || {};
  const ed = data.email_data || {};
  const type: string = ed.email_action_type;

  const kindByType: Record<string, Kind> = { signup: 'confirmation', recovery: 'recovery', magiclink: 'magic_link', invite: 'invite', reauthentication: 'code' };
  const kind = kindByType[type];
  if (!kind) {
    // Cambio de correo y otros tipos que la web no usa: no se envian desde aqui
    console.warn('Tipo de correo no soportado por el hook:', type);
    return fail(400, `Tipo de correo no soportado: ${type}`);
  }

  const t = TPL[kind];
  const verifyType = type === 'magiclink' ? 'magiclink' : type;
  const url = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${encodeURIComponent(ed.token_hash)}&type=${verifyType}&redirect_to=${encodeURIComponent(ed.redirect_to || ed.site_url || BASE)}`;
  const body = kind === 'code' ? codeBody(String(ed.token || '')) : linkBody(t.text(user.email || ''), t.button, t.notice, esc(url));
  const html = shell(t.icon, t.title, body, t.pre);
  const text = kind === 'code' ? `${t.title}: ${ed.token}` : `${t.title}\n\n${t.button}: ${url}\n\n${t.notice}`;

  try {
    const port = Number(Deno.env.get('SMTP_PORT') || 465);
    const transport = nodemailer.createTransport({
      host: Deno.env.get('SMTP_HOST') || 'smtp.hostinger.com',
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transport.sendMail({ from: Deno.env.get('SMTP_FROM') || `Habitaclick <${smtpUser}>`, to: user.email, subject: t.subject, html, text });
  } catch (e) {
    console.error('Error SMTP', e);
    return fail(500, 'No se pudo enviar el correo');
  }
  return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
});
