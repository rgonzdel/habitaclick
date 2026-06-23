const nodemailer = require('nodemailer');

const isConfigured = () =>
  !!(process.env.SMTP_USER && process.env.SMTP_PASS &&
  process.env.SMTP_USER !== 'tucorreo@gmail.com');

let transporter = null;

const getTransporter = () => {
  if (!transporter && isConfigured()) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendAssignmentEmail = async ({ toEmail, toName, property, assignedBy }) => {
  if (!isConfigured()) {
    console.log(`[Mailer] SMTP no configurado. Email no enviado a ${toEmail}`);
    return;
  }
  const t = getTransporter();
  if (!t) return;

  const typeLabels = { apartment: 'Apartamento', house: 'Casa', land: 'Terreno', commercial: 'Comercial' };
  const txLabels = { sale: 'Venta', rent: 'Alquiler' };

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#003366;padding:28px 36px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">HabitaClick</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Gestión inmobiliaria</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px;">
            <p style="margin:0 0 6px;font-size:15px;color:#374151;">Hola <strong>${toName || toEmail}</strong>,</p>
            <p style="margin:0 0 28px;font-size:15px;color:#374151;">Se te ha asignado una nueva operación inmobiliaria en HabitaClick.</p>

            <!-- Property Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1.5px solid #e0e7ff;border-radius:10px;margin-bottom:28px;">
              <tr>
                <td style="padding:24px 28px;">
                  ${property.reference ? `<p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#6366f1;letter-spacing:0.05em;text-transform:uppercase;">${property.reference}</p>` : ''}
                  <p style="margin:0 0 14px;font-size:20px;font-weight:700;color:#003366;">${property.title}</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:4px 0;font-size:14px;color:#555;">📍 Ubicación</td>
                      <td style="padding:4px 0;font-size:14px;color:#111;font-weight:600;">${property.address}, ${property.city} (${property.province})</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:14px;color:#555;">🏠 Tipo</td>
                      <td style="padding:4px 0;font-size:14px;color:#111;font-weight:600;">${typeLabels[property.property_type] || property.property_type}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:14px;color:#555;">📋 Operación</td>
                      <td style="padding:4px 0;font-size:14px;color:#111;font-weight:600;">${txLabels[property.transaction_type] || property.transaction_type}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:14px;color:#555;">💶 Precio</td>
                      <td style="padding:4px 0;font-size:18px;color:#003366;font-weight:700;">${Number(property.price).toLocaleString('es-ES')} €</td>
                    </tr>
                    ${property.description ? `
                    <tr>
                      <td colspan="2" style="padding:12px 0 0;">
                        <p style="margin:0;font-size:13px;color:#6b7280;font-style:italic;">"${property.description.slice(0, 200)}${property.description.length > 200 ? '…' : ''}"</p>
                      </td>
                    </tr>` : ''}
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 28px;font-size:14px;color:#6b7280;">
              Asignado por <strong style="color:#374151;">${assignedBy}</strong>.
              Inicia sesión en HabitaClick para gestionar esta operación.
            </p>
            <a href="http://localhost:3000" style="display:inline-block;background:#003366;color:#fff;padding:13px 30px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
              Ir a HabitaClick →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:18px 36px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Este mensaje fue generado automáticamente por HabitaClick. Por favor no respondas a este correo.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || `HabitaClick <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `📋 Nueva operación asignada: ${property.title}`,
      html,
    });
    console.log(`[Mailer] Email enviado a ${toEmail}`);
  } catch (err) {
    console.error(`[Mailer] Error enviando email a ${toEmail}:`, err.message);
  }
};

const sendEmail = async ({ to, subject, html }) => {
  if (!isConfigured()) {
    console.log(`[Mailer] SMTP no configurado. Email no enviado a ${to}`);
    return;
  }
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || `HabitaClick <${process.env.SMTP_USER}>`,
      to, subject, html
    });
    console.log(`[Mailer] Email enviado a ${to}`);
  } catch (err) {
    console.error(`[Mailer] Error enviando a ${to}:`, err.message);
  }
};

module.exports = { sendAssignmentEmail, sendEmail, isConfigured };
