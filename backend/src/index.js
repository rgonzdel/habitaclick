const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { sendAssignmentEmail } = require('./mailer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Directorio de uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Servir archivos estáticos (políticas HTML y uploads)
app.use(express.static(path.join(__dirname, '../../frontend/public')));
app.use('/uploads', express.static(uploadsDir));

// Importar y registrar rutas de políticas
const politicasRoutes = require('../routes/politicas-routes');
app.use('/', politicasRoutes);

const supabaseUrl = 'https://jazmfctpkaxgwvezbcig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphem1mY3Rwa2F4Z3d2ZXpiY2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NzMyMDQsImV4cCI6MjA5NzU0OTIwNH0.-p1DWnC82k65PkCPwJL39RsbwCTslSmexU77ghKRFWo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secret_key_aqui';

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsDir, req.params.id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedExts = /\.(jpe?g|png|gif|webp|mp4|mov|avi|mkv)$/i;
    if (allowedExts.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Formato no soportado'));
  }
});

// Middleware JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware de roles: requireRole('director', 'administrador')
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  const userRole = req.user.role || 'asesor';
  if (!roles.includes(userRole)) {
    return res.status(403).json({ error: `Acción reservada para: ${roles.join(', ')}` });
  }
  next();
};

// Almacén en memoria de códigos de recuperación: email → { code, expires }
const resetCodes = new Map();

// Health
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK' });
});

// REGISTRO
app.post('/api/v1/auth/register', async (req, res) => {
  const { email, password, company_name } = req.body;
  if (!email || !password || !company_name) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password, company_name }])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    const role = data[0].role || 'asesor';
    const token = jwt.sign(
      { id: data[0].id, email: data[0].email, company_name: data[0].company_name, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, token, user: { id: data[0].id, email: data[0].email, company_name: data[0].company_name, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos' });
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
    if (error || !data) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const role = data.role || 'asesor';
    const token = jwt.sign(
      { id: data.id, email: data.email, company_name: data.company_name, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, token, user: { id: data.id, email: data.email, company_name: data.company_name, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FORGOT PASSWORD — envía código de 6 dígitos al email
app.post('/api/v1/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });
  try {
    const { data: user } = await supabase.from('users').select('id, nombre, apellidos, email').eq('email', email).single();
    if (!user) return res.status(404).json({ error: 'Este email no corresponde a ningún usuario registrado' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    resetCodes.set(email, { code, expires: Date.now() + 15 * 60 * 1000 }); // 15 min

    const name = user.nombre ? `${user.nombre} ${user.apellidos || ''}`.trim() : email;
    const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#003366;padding:26px 36px;">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">HabitaClick</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Recuperación de contraseña</p>
        </td></tr>
        <tr><td style="padding:36px;">
          <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hola <strong>${name}</strong>,</p>
          <p style="margin:0 0 28px;font-size:15px;color:#374151;">Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código:</p>
          <div style="text-align:center;margin:0 0 28px;">
            <span style="display:inline-block;background:#f0f4ff;border:2px solid #c7d2fe;border-radius:12px;padding:18px 36px;font-size:36px;font-weight:800;letter-spacing:10px;color:#003366;font-family:monospace;">${code}</span>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-align:center;">Este código caduca en <strong>15 minutos</strong>.</p>
          <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">Si no solicitaste este cambio, ignora este mensaje.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 36px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">HabitaClick · Gestión inmobiliaria</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`.trim();

    const { sendEmail, isConfigured } = require('./mailer');

    if (isConfigured()) {
      sendEmail({ to: email, subject: `${code} — Tu código de verificación HabitaClick`, html });
      res.json({ success: true });
    } else {
      console.log(`[DEV] Código para ${email}: ${code}`);
      // En modo dev (sin SMTP) devolvemos el código para que se pueda probar
      res.json({ success: true, devCode: code });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY CODE — valida el código sin cambiar la contraseña aún
app.post('/api/v1/auth/verify-reset-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email y código requeridos' });
  const entry = resetCodes.get(email);
  if (!entry) return res.status(400).json({ error: 'Código no encontrado o ya usado' });
  if (Date.now() > entry.expires) {
    resetCodes.delete(email);
    return res.status(400).json({ error: 'El código ha caducado. Solicita uno nuevo.' });
  }
  if (entry.code !== String(code).trim()) {
    return res.status(400).json({ error: 'Código incorrecto' });
  }
  // Marcar como verificado pero no borrar aún (se borra al cambiar la contraseña)
  entry.verified = true;
  res.json({ success: true });
});

// RESET PASSWORD — cambia la contraseña si el código está verificado
app.post('/api/v1/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'Faltan datos' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  const entry = resetCodes.get(email);
  if (!entry || !entry.verified || entry.code !== String(code).trim()) {
    return res.status(400).json({ error: 'Verificación inválida. Vuelve a empezar.' });
  }
  try {
    const { error } = await supabase.from('users').update({ password: newPassword }).eq('email', email);
    if (error) return res.status(500).json({ error: error.message });
    resetCodes.delete(email);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET usuarios simple (para selector de asignación — todos los autenticados)
app.get('/api/v1/users/simple', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellidos, email, cargo, role')
      .order('nombre', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET PROPIEDADES (con fotos y datos de asesor asignado)
app.get('/api/v1/properties', verifyToken, async (req, res) => {
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_email', req.user.email)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    if (properties && properties.length > 0) {
      const ids = properties.map(p => p.id);
      const [{ data: photos }, { data: allUsers }] = await Promise.all([
        supabase.from('property_photos').select('*').in('property_id', ids)
          .order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('users').select('id, nombre, apellidos, email, cargo, role')
      ]);

      const userMap = {};
      (allUsers || []).forEach(u => { userMap[u.id] = u; });

      const propertiesWithPhotos = properties.map(p => ({
        ...p,
        photos: photos ? photos.filter(ph => ph.property_id === p.id) : [],
        assigned_user: p.assigned_to ? userMap[p.assigned_to] || null : null
      }));
      return res.json({ success: true, properties: propertiesWithPhotos });
    }

    res.json({ success: true, properties: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT PROPIEDAD (editar)
app.put('/api/v1/properties/:id', verifyToken, async (req, res) => {
  const { title, price, address, city, province, property_type, transaction_type, bedrooms, bathrooms, square_meters, description, assigned_to, estado } = req.body;
  if (!title || !price || !address || !city || !province) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    // Leer el estado anterior para detectar cambio de asignación
    const { data: prev } = await supabase
      .from('properties')
      .select('assigned_to, title, reference, address, city, province, price, property_type, transaction_type, description')
      .eq('id', req.params.id)
      .single();

    const { data, error } = await supabase
      .from('properties')
      .update({ title, price, address, city, province, property_type, transaction_type, bedrooms, bathrooms, square_meters, description, assigned_to: assigned_to || null, estado: estado || 'disponible' })
      .eq('id', req.params.id)
      .eq('user_email', req.user.email)
      .select();
    if (error) return res.status(500).json({ error: error.message });

    // Enviar email si se asignó o cambió la asignación
    if (assigned_to && assigned_to !== prev?.assigned_to) {
      const { data: assignee } = await supabase.from('users').select('email, nombre, apellidos').eq('id', assigned_to).single();
      if (assignee) {
        sendAssignmentEmail({
          toEmail: assignee.email,
          toName: `${assignee.nombre || ''} ${assignee.apellidos || ''}`.trim() || assignee.email,
          property: data[0],
          assignedBy: req.user.email
        });
      }
    }

    res.json({ success: true, property: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST PROPIEDAD
app.post('/api/v1/properties', verifyToken, async (req, res) => {
  const { title, price, address, city, province, property_type, transaction_type, bedrooms, bathrooms, square_meters, description, assigned_to, estado } = req.body;
  if (!title || !price || !address || !city || !province) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    // Generar referencia única HAB-XXXXX
    const { data: lastRef } = await supabase
      .from('properties')
      .select('reference')
      .not('reference', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);
    let refNum = 1;
    if (lastRef && lastRef.length > 0 && lastRef[0].reference) {
      const match = lastRef[0].reference.match(/(\d+)$/);
      if (match) refNum = parseInt(match[1]) + 1;
    }
    const reference = `HAB-${String(refNum).padStart(5, '0')}`;

    const { data, error } = await supabase
      .from('properties')
      .insert([{
        title, price, address, city, province,
        property_type, transaction_type, bedrooms, bathrooms, square_meters,
        description, reference,
        assigned_to: assigned_to || null,
        estado: estado || 'disponible',
        user_email: req.user.email,
        publication_status: 'draft'
      }])
      .select();
    if (error) return res.status(500).json({ error: error.message });

    // Enviar email de asignación si se asignó al crear
    if (assigned_to) {
      const { data: assignee } = await supabase.from('users').select('email, nombre, apellidos').eq('id', assigned_to).single();
      if (assignee) {
        sendAssignmentEmail({
          toEmail: assignee.email,
          toName: `${assignee.nombre || ''} ${assignee.apellidos || ''}`.trim() || assignee.email,
          property: data[0],
          assignedBy: req.user.email
        });
      }
    }

    res.status(201).json({ success: true, property: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE PROPIEDAD (con limpieza de fotos)
app.delete('/api/v1/properties/:id', verifyToken, async (req, res) => {
  try {
    const { data: photos } = await supabase
      .from('property_photos')
      .select('url')
      .eq('property_id', req.params.id);

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', req.params.id)
      .eq('user_email', req.user.email);

    if (error) return res.status(500).json({ error: error.message });

    if (photos) {
      photos.forEach(photo => {
        const filePath = path.join(__dirname, '../../', photo.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }
    await supabase.from('property_photos').delete().eq('property_id', req.params.id);

    res.json({ success: true, message: 'Eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST FOTOS/VÍDEOS de una propiedad
app.post('/api/v1/properties/:id/photos', verifyToken, upload.array('files', 30), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron archivos' });
    }

    const { data: existing } = await supabase
      .from('property_photos')
      .select('id, sort_order')
      .eq('property_id', req.params.id)
      .order('sort_order', { ascending: false })
      .limit(1);

    const hasExisting = existing && existing.length > 0;
    const nextOrder = hasExisting ? (existing[0].sort_order || 0) + 1 : 0;

    const records = req.files.map((file, index) => {
      const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(file.originalname);
      return {
        property_id: req.params.id,
        url: `/uploads/${req.params.id}/${file.filename}`,
        filename: file.originalname,
        is_primary: !hasExisting && index === 0 && !isVideo,
        media_type: isVideo ? 'video' : 'photo',
        sort_order: nextOrder + index
      };
    });

    const { data, error } = await supabase
      .from('property_photos')
      .insert(records)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, photos: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE FOTO individual
app.delete('/api/v1/properties/:id/photos/:photoId', verifyToken, async (req, res) => {
  try {
    const { data: photo } = await supabase
      .from('property_photos')
      .select('*')
      .eq('id', req.params.photoId)
      .single();

    if (photo) {
      const filePath = path.join(__dirname, '../../', photo.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const { error } = await supabase
      .from('property_photos')
      .delete()
      .eq('id', req.params.photoId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH — reordenar fotos/vídeos
app.patch('/api/v1/properties/:id/photos/reorder', verifyToken, async (req, res) => {
  try {
    const { order } = req.body;

    await Promise.all(order.map(item =>
      supabase
        .from('property_photos')
        .update({ sort_order: item.sort_order, is_primary: item.is_primary })
        .eq('id', item.id)
    ));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH — marcar foto como principal
app.patch('/api/v1/properties/:id/photos/:photoId/primary', verifyToken, async (req, res) => {
  try {
    await supabase
      .from('property_photos')
      .update({ is_primary: false })
      .eq('property_id', req.params.id);

    const { error } = await supabase
      .from('property_photos')
      .update({ is_primary: true })
      .eq('id', req.params.photoId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET usuarios (director y administrador)
app.get('/api/v1/users', verifyToken, requireRole('director', 'administrador'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, nombre, apellidos, cargo, ubicacion_oficina, role, created_at')
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear usuario (director y administrador)
app.post('/api/v1/users', verifyToken, requireRole('director', 'administrador'), async (req, res) => {
  const { nombre, apellidos, email, password, cargo, ubicacion_oficina, role } = req.body;
  if (!nombre || !apellidos || !email || !password || !cargo || !ubicacion_oficina) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  // Los directores solo pueden crear asesores
  if (req.user.role === 'director' && role === 'administrador') {
    return res.status(403).json({ error: 'Los directores no pueden crear administradores' });
  }
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        nombre, apellidos, email, password, cargo, ubicacion_oficina,
        role: role || 'asesor',
        company_name: req.user.company_name
      }])
      .select('id, email, nombre, apellidos, cargo, ubicacion_oficina, role, created_at');
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ success: true, user: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT rol de usuario (solo administrador)
app.put('/api/v1/users/:id/role', verifyToken, requireRole('administrador'), async (req, res) => {
  const { role } = req.body;
  if (!['asesor', 'director', 'administrador'].includes(role)) {
    return res.status(400).json({ error: 'Rol no válido' });
  }
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, email, nombre, apellidos, role');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, user: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Captura errores de multer y otros no controlados
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Backend en http://localhost:${PORT}/api/v1`);
});
