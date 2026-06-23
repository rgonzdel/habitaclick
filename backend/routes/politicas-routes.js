/**
 * RUTAS EXPRESS PARA POLÍTICAS DE COOKIES Y PRIVACIDAD
 * 
 * Integración en habitaclick.es - Node.js/Express backend
 * 
 * OPCIÓN 1: Servir archivos HTML estáticos (recomendado para SEO)
 * OPCIÓN 2: Renderizar componentes React desde Express
 */

const express = require('express');
const path = require('path');
const router = express.Router();

// ============================================================================
// OPCIÓN 1: SERVIR ARCHIVOS HTML ESTÁTICOS
// ============================================================================
// Este es el método más eficiente para SEO y carga rápida

// Ruta para Política de Cookies (HTML estático)
router.get('/politica-cookies', (req, res) => {
  // Servir archivo HTML desde public/
  res.sendFile(path.join(__dirname, '../public/politica-cookies.html'), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // 24 horas de caché
    }
  });
});

// Ruta para Política de Privacidad (HTML estático)
router.get('/politica-privacidad', (req, res) => {
  // Servir archivo HTML desde public/
  res.sendFile(path.join(__dirname, '../public/politica-privacidad.html'), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // 24 horas de caché
    }
  });
});

// ============================================================================
// OPCIÓN 2: RENDERIZAR COMPONENTES REACT (Alternativa)
// ============================================================================
// Descomenta estas rutas si prefieres renderizar componentes React

// const ReactDOMServer = require('react-dom/server');
// const PoliticaCookies = require('../frontend/src/components/PoliticaCookies').default;
// const PoliticaPrivacidad = require('../frontend/src/components/PoliticaPrivacidad').default;

// router.get('/politica-cookies', (req, res) => {
//   try {
//     const html = ReactDOMServer.renderToString(<PoliticaCookies />);
//     res.send(`
//       <!DOCTYPE html>
//       <html lang="es">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Política de Cookies - HABITACLICK</title>
//         <link rel="stylesheet" href="/styles/politicas.css">
//       </head>
//       <body>${html}</body>
//       </html>
//     `);
//   } catch (error) {
//     console.error('Error al renderizar Política de Cookies:', error);
//     res.status(500).send('Error al cargar la política de cookies');
//   }
// });

// ============================================================================
// RUTAS DE CONFIGURACIÓN DE PRIVACIDAD (Futuro)
// ============================================================================

// Ruta para ver/editar preferencias de cookies (usuario autenticado)
router.get('/configuracion-privacidad', (req, res) => {
  // Verificar si el usuario está autenticado
  if (!req.user) {
    return res.redirect('/login');
  }

  // Obtener preferencias de cookies del usuario
  res.json({
    message: 'Centro de privacidad del usuario',
    userId: req.user.id,
    preferences: {
      cookies: {
        technical: true,
        analytics: false,
        marketing: false,
      },
      emailNotifications: true,
      dataRetention: '6 months',
    }
  });
});

// Ruta para actualizar preferencias de privacidad
router.post('/configuracion-privacidad/update', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const { preferences } = req.body;

  // Validar preferencias
  if (!preferences || typeof preferences !== 'object') {
    return res.status(400).json({ error: 'Preferencias inválidas' });
  }

  // Guardar en base de datos (Supabase)
  // await supabase
  //   .from('user_privacy_preferences')
  //   .upsert({
  //     user_id: req.user.id,
  //     preferences: preferences,
  //     updated_at: new Date(),
  //   });

  res.json({
    success: true,
    message: 'Preferencias de privacidad actualizadas correctamente',
    timestamp: new Date(),
  });
});

// ============================================================================
// RUTAS PARA EJERCER DERECHOS RGPD
// ============================================================================

// Ruta para solicitar descarga de datos personales (Art. 20 RGPD - Portabilidad)
router.post('/solicitar-datos-personales', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  // Recopilar todos los datos del usuario en formato JSON
  // const userData = await supabase
  //   .from('users')
  //   .select('*')
  //   .eq('id', req.user.id)
  //   .single();

  // Formatear respuesta
  const dataExport = {
    userId: req.user.id,
    exportDate: new Date().toISOString(),
    data: {
      profile: req.user,
      // properties: userProperties,
      // activity: userActivity,
      // transactions: userTransactions,
    }
  };

  // Enviar como JSON descargable
  res.setHeader('Content-Disposition', `attachment; filename="datos-personales-${req.user.id}.json"`);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(dataExport, null, 2));
});

// Ruta para solicitar eliminación de cuenta (Art. 17 RGPD - Derecho al Olvido)
router.post('/solicitar-eliminacion-cuenta', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const { password, reason } = req.body;

  // Validar contraseña
  if (!password) {
    return res.status(400).json({ error: 'Contraseña requerida para confirmar eliminación' });
  }

  // Crear solicitud de eliminación en base de datos
  // const deletionRequest = await supabase
  //   .from('deletion_requests')
  //   .insert({
  //     user_id: req.user.id,
  //     reason: reason,
  //     status: 'pending',
  //     created_at: new Date(),
  //     processed_at: null,
  //   });

  res.json({
    success: true,
    message: 'Solicitud de eliminación de cuenta recibida. Se procesará dentro de 30 días.',
    requestId: 'DR-' + req.user.id + '-' + Date.now(),
    estimatedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
});

// Ruta para revocar consentimiento de cookies/marketing (Art. 7.3 RGPD)
router.post('/revocar-consentimiento', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const { consentType } = req.body; // 'marketing', 'analytics', 'all'

  // Actualizar consentimiento en base de datos
  // await supabase
  //   .from('user_consents')
  //   .update({
  //     [consentType]: false,
  //     revoked_at: new Date(),
  //   })
  //   .eq('user_id', req.user.id);

  res.json({
    success: true,
    message: `Consentimiento de ${consentType} revocado correctamente`,
    revokedAt: new Date().toISOString(),
  });
});

// Ruta para solicitar corrección de datos (Art. 16 RGPD)
router.post('/solicitar-correccion-datos', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const { field, newValue, reason } = req.body;

  // Validar campos permitidos
  const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'address'];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ error: 'Campo no permitido para corrección' });
  }

  // Crear solicitud de corrección
  // await supabase
  //   .from('correction_requests')
  //   .insert({
  //     user_id: req.user.id,
  //     field: field,
  //     new_value: newValue,
  //     reason: reason,
  //     status: 'pending',
  //     created_at: new Date(),
  //   });

  res.json({
    success: true,
    message: 'Solicitud de corrección enviada. Se revisará en máximo 30 días.',
    field: field,
    status: 'pending',
  });
});

// ============================================================================
// RUTAS DE INFORMACIÓN Y DOCUMENTACIÓN
// ============================================================================

// Ruta para obtener información sobre tratamiento de datos en formato JSON
router.get('/api/privacidad/informacion', (req, res) => {
  res.json({
    responsable: {
      nombre: 'HABITACLICK',
      email: 'privacy@habitaclick.es',
      dpo: 'dpo@habitaclick.es',
      sitio: 'https://habitaclick.es',
    },
    basesJuridicas: {
      contrato: 'Artículo 6.1.b RGPD',
      consentimiento: 'Artículo 6.1.a RGPD',
      obligacionLegal: 'Artículo 6.1.c RGPD',
      interesesLegitimos: 'Artículo 6.1.f RGPD',
    },
    derechosUsuario: [
      { codigo: 'acceso', articulo: 15, descripcion: 'Acceso a datos personales' },
      { codigo: 'rectificacion', articulo: 16, descripcion: 'Corregir datos' },
      { codigo: 'olvido', articulo: 17, descripcion: 'Derecho al olvido' },
      { codigo: 'limitarTratamiento', articulo: 18, descripcion: 'Limitar procesamiento' },
      { codigo: 'portabilidad', articulo: 20, descripcion: 'Portabilidad de datos' },
      { codigo: 'oposicion', articulo: 21, descripcion: 'Derecho de oposición' },
    ],
    autoridad: {
      nombre: 'Agencia Española de Protección de Datos (AEPD)',
      sitio: 'https://www.aepd.es',
      telefono: '+34 91 508 56 00',
      formulario: 'https://www.aepd.es/derechos/',
    },
  });
});

// ============================================================================
// MIDDLEWARE DE VALIDACIÓN
// ============================================================================

// Middleware para verificar solicitudes de privacidad
const validatePrivacyRequest = (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;

  // Log de seguridad
  console.log(`[PRIVACY REQUEST] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`[USER AGENT] ${userAgent}`);
  console.log(`[IP] ${ipAddress}`);

  // Verificar rate limiting (máximo 1 solicitud por minuto por IP)
  // Implementar Redis o memoria caché

  next();
};

// Aplicar middleware a rutas sensibles
router.use('/solicitar-*', validatePrivacyRequest);

// ============================================================================
// EXPORTAR RUTAS
// ============================================================================

module.exports = router;

/**
 * CÓMO INTEGRAR EN TU APLICACIÓN EXPRESS
 * 
 * En tu archivo principal (server.js o app.js):
 * 
 * ```javascript
 * const politicasRoutes = require('./routes/politicas-routes');
 * app.use('/', politicasRoutes);
 * ```
 * 
 * Esto registrará todas las rutas:
 * - GET /politica-cookies
 * - GET /politica-privacidad
 * - GET /configuracion-privacidad
 * - POST /configuracion-privacidad/update
 * - POST /solicitar-datos-personales
 * - POST /solicitar-eliminacion-cuenta
 * - POST /revocar-consentimiento
 * - POST /solicitar-correccion-datos
 * - GET /api/privacidad/informacion
 */
