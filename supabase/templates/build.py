#!/usr/bin/env python3
"""Genera las plantillas HTML de los correos de Supabase Auth. Uso: python3 build.py"""
import os

NAVY = "#003366"
GREEN = "#2ECC71"
BASE = "https://habitaclick.es"

# clave: (icono, titulo, texto, boton, aviso de seguridad, preheader)
TEMPLATES = {
    "confirmation": (
        "confirm",
        "Confirma tu correo",
        "Gracias por crear tu cuenta en Habitaclick. Confirma que <b>{{ .Email }}</b> es tuyo para empezar a publicar anuncios, guardar favoritos y crear alertas.",
        "Confirmar mi correo",
        "Si no has creado una cuenta en Habitaclick, ignora este mensaje: no se activará nada.",
        "Confirma tu correo para activar tu cuenta de Habitaclick.",
    ),
    "recovery": (
        "recovery",
        "Restablece tu contraseña",
        "Hemos recibido una solicitud para cambiar la contraseña de tu cuenta de Habitaclick. Pulsa el botón para elegir una nueva.",
        "Cambiar mi contraseña",
        "Si no lo has pedido tú, ignora este mensaje: tu contraseña actual seguirá funcionando y no cambiará nada.",
        "Elige una nueva contraseña para tu cuenta de Habitaclick.",
    ),
    "magic_link": (
        "magic",
        "Tu enlace de acceso",
        "Pulsa el botón para entrar en tu cuenta de Habitaclick sin escribir la contraseña. El enlace solo se puede usar una vez.",
        "Entrar en Habitaclick",
        "Si no has solicitado este acceso, ignora este mensaje y no compartas el enlace con nadie.",
        "Tu enlace para entrar en Habitaclick.",
    ),
    "email_change": (
        "email",
        "Confirma tu nuevo correo",
        "Has pedido cambiar el correo de tu cuenta de Habitaclick a <b>{{ .NewEmail }}</b>. Confirma el cambio con el botón de abajo.",
        "Confirmar el cambio",
        "Si no has pedido este cambio, ignora este mensaje y revisa la seguridad de tu cuenta.",
        "Confirma el cambio de correo de tu cuenta de Habitaclick.",
    ),
    "invite": (
        "invite",
        "Te han invitado a Habitaclick",
        "Te han invitado a unirte a Habitaclick, el portal de anuncios inmobiliarios. Acepta la invitación para crear tu cuenta.",
        "Aceptar invitación",
        "Si no esperabas esta invitación, puedes ignorarla sin más.",
        "Acepta tu invitación a Habitaclick.",
    ),
}


def shell(icon, title, body_html, preheader):
    return f"""<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#1c2733;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">{preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dfe5ec;">
<tr><td bgcolor="{NAVY}" style="background:{NAVY};padding:24px 32px;"><a href="{BASE}" style="text-decoration:none;"><img src="{BASE}/brand/logo-email.png" alt="Habitaclick" height="30" style="display:block;border:0;height:30px;width:auto;color:#ffffff;font-size:22px;font-weight:bold;"></a></td></tr>
<tr><td bgcolor="{GREEN}" height="4" style="background:{GREEN};height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td align="center" style="padding:36px 32px 8px;">
<img src="{BASE}/brand/email-{icon}.png" alt="" width="64" height="64" style="display:block;border:0;width:64px;height:64px;border-radius:32px;background:#E9F7F0;">
<h1 style="margin:20px 0 12px;font-size:26px;line-height:1.25;color:{NAVY};font-weight:800;">{title}</h1>
{body_html}
</td></tr>
<tr><td style="padding:8px 32px 30px;"></td></tr>
<tr><td bgcolor="#f7f9fb" style="background:#f7f9fb;border-top:1px solid #e6ebf0;padding:22px 32px;text-align:center;font-size:12px;line-height:1.6;color:#8393a3;">
<a href="{BASE}" style="color:#5c6e80;text-decoration:none;">habitaclick.es</a> &nbsp;·&nbsp; <a href="{BASE}/legal/privacidad" style="color:#5c6e80;text-decoration:none;">Privacidad</a> &nbsp;·&nbsp; <a href="{BASE}/legal/aviso-legal" style="color:#5c6e80;text-decoration:none;">Aviso legal</a><br>
Correo automático de Habitaclick, el portal de anuncios inmobiliarios.
</td></tr>
</table>
</td></tr></table>
</body></html>
"""


def link_body(text, button, notice):
    url = "{{ .ConfirmationURL }}"
    return f"""<p style="margin:0 0 26px;font-size:16px;line-height:1.6;color:#3b4a5a;max-width:440px;">{text}</p>
<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td align="center" bgcolor="{GREEN}" style="background:{GREEN};border-radius:10px;"><a href="{url}" style="display:inline-block;padding:15px 36px;font-size:16px;font-weight:700;color:#0b2b18;text-decoration:none;border-radius:10px;">{button}</a></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td style="background:#f3f6f9;border-radius:10px;padding:14px 16px;font-size:12px;line-height:1.6;color:#667585;text-align:left;">Si el botón no funciona, copia este enlace en tu navegador:<br><a href="{url}" style="color:{NAVY};word-break:break-all;">{url}</a></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;"><tr><td style="border-left:3px solid {GREEN};padding:4px 0 4px 14px;font-size:13px;line-height:1.6;color:#667585;text-align:left;">{notice}</td></tr></table>"""


def code_body():
    return f"""<p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#3b4a5a;max-width:440px;">Introduce este código para confirmar la acción en tu cuenta de Habitaclick:</p>
<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td align="center" style="background:#f3f6f9;border:2px dashed #c9d4df;border-radius:12px;padding:16px 30px;font-size:34px;font-weight:800;letter-spacing:10px;color:{NAVY};font-family:'Courier New',monospace;">{{{{ .Token }}}}</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td style="border-left:3px solid {GREEN};padding:4px 0 4px 14px;font-size:13px;line-height:1.6;color:#667585;text-align:left;">Si no has pedido este código, ignora este mensaje y no lo compartas con nadie. Habitaclick nunca te lo pedirá por teléfono ni por mensaje.</td></tr></table>"""


here = os.path.dirname(os.path.abspath(__file__))
for key, (icon, title, text, button, notice, pre) in TEMPLATES.items():
    html = shell(icon, title, link_body(text, button, notice), pre)
    open(os.path.join(here, f"{key}.html"), "w", encoding="utf-8").write(html)
html = shell("shield", "Código de verificación", code_body(), "Tu código de verificación de Habitaclick.")
open(os.path.join(here, "reauthentication.html"), "w", encoding="utf-8").write(html)
print("ok", sorted(f for f in os.listdir(here) if f.endswith(".html")))
