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

const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey);

const STORAGE_BUCKET = 'property-photos';
// Crear el bucket si no existe (se ejecuta una vez al arrancar)
(async () => {
  const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
  if (error && !error.message.includes('already exists')) console.warn('Storage bucket:', error.message);
})();

app.use(cors());
app.use(express.json());

// Health check / wake-up ping
app.get('/ping', (req, res) => res.json({ ok: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secret_key_aqui';

// Multer en memoria — los archivos se suben a Supabase Storage, no al disco
const upload = multer({
  storage: multer.memoryStorage(),
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
  const {
    title, price, address, city, province, property_type, transaction_type,
    bedrooms, bathrooms, square_meters, description, assigned_to, estado,
    latitude, longitude,
    postal_code, street_number, floor, door, block_num, portal_door,
    district, zone, urbanization, useful_area, year_built, community_fees,
    show_price, features, energy_consumption_cert, energy_emission_cert,
    energy_consumption_value, co2_emission_value, video_url, virtual_tour_url,
    cadastral_reference, owner, second_owner, has_keys, key_reference,
    sign_on_property, ibi, agreement_type, agreement_from, agreement_to,
    commission_percentage, commission_value, shared_commission_pct,
    terrace_area, garage_area, garage_price,
  } = req.body;
  if (!title || !price) {
    return res.status(400).json({ error: 'Título y precio son obligatorios' });
  }
  try {
    const { data: prev } = await supabase
      .from('properties')
      .select('assigned_to, title, reference, address, city, province, price, property_type, transaction_type, description')
      .eq('id', req.params.id)
      .single();

    const { data, error } = await supabase
      .from('properties')
      .update({
        title, price, address, city, province, property_type, transaction_type,
        bedrooms, bathrooms, square_meters, description,
        latitude: latitude || null, longitude: longitude || null,
        assigned_to: assigned_to || null, estado: estado || 'disponible',
        postal_code: postal_code || null, street_number: street_number || null,
        floor: floor || null, door: door || null, block_num: block_num || null,
        portal_door: portal_door || null, district: district || null,
        zone: zone || null, urbanization: urbanization || null,
        useful_area: useful_area ? parseFloat(useful_area) : null,
        year_built: year_built ? parseInt(year_built) : null,
        community_fees: community_fees ? parseFloat(community_fees) : null,
        show_price: show_price !== undefined ? show_price : true,
        features: features || [],
        energy_consumption_cert: energy_consumption_cert || 'en_tramite',
        energy_emission_cert: energy_emission_cert || 'en_tramite',
        energy_consumption_value: energy_consumption_value ? parseFloat(energy_consumption_value) : null,
        co2_emission_value: co2_emission_value ? parseFloat(co2_emission_value) : null,
        video_url: video_url || null, virtual_tour_url: virtual_tour_url || null,
        cadastral_reference: cadastral_reference || null, owner: owner || null,
        second_owner: second_owner || null, has_keys: has_keys || false,
        key_reference: key_reference || null, sign_on_property: sign_on_property || false,
        ibi: ibi ? parseFloat(ibi) : null, agreement_type: agreement_type || null,
        agreement_from: agreement_from || null, agreement_to: agreement_to || null,
        commission_percentage: commission_percentage ? parseFloat(commission_percentage) : null,
        commission_value: commission_value ? parseFloat(commission_value) : null,
        shared_commission_pct: shared_commission_pct ? parseFloat(shared_commission_pct) : null,
        terrace_area: terrace_area ? parseFloat(terrace_area) : null,
        garage_area: garage_area ? parseFloat(garage_area) : null,
        garage_price: garage_price ? parseFloat(garage_price) : null,
      })
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
  const {
    title, price, address, city, province, property_type, transaction_type,
    bedrooms, bathrooms, square_meters, description, assigned_to, estado,
    latitude, longitude,
    postal_code, street_number, floor, door, block_num, portal_door,
    district, zone, urbanization, useful_area, year_built, community_fees,
    show_price, features, energy_consumption_cert, energy_emission_cert,
    energy_consumption_value, co2_emission_value, video_url, virtual_tour_url,
    cadastral_reference, owner, second_owner, has_keys, key_reference,
    sign_on_property, ibi, agreement_type, agreement_from, agreement_to,
    commission_percentage, commission_value, shared_commission_pct,
    terrace_area, garage_area, garage_price,
  } = req.body;
  if (!title || !price) {
    return res.status(400).json({ error: 'Título y precio son obligatorios' });
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
        title, price, address: address || null, city: city || null,
        province: province || null, property_type, transaction_type,
        bedrooms, bathrooms, square_meters, description, reference,
        latitude: latitude || null, longitude: longitude || null,
        assigned_to: assigned_to || null, estado: estado || 'disponible',
        user_email: req.user.email, publication_status: 'draft',
        postal_code: postal_code || null, street_number: street_number || null,
        floor: floor || null, door: door || null, block_num: block_num || null,
        portal_door: portal_door || null, district: district || null,
        zone: zone || null, urbanization: urbanization || null,
        useful_area: useful_area ? parseFloat(useful_area) : null,
        year_built: year_built ? parseInt(year_built) : null,
        community_fees: community_fees ? parseFloat(community_fees) : null,
        show_price: show_price !== undefined ? show_price : true,
        features: features || [],
        energy_consumption_cert: energy_consumption_cert || 'en_tramite',
        energy_emission_cert: energy_emission_cert || 'en_tramite',
        energy_consumption_value: energy_consumption_value ? parseFloat(energy_consumption_value) : null,
        co2_emission_value: co2_emission_value ? parseFloat(co2_emission_value) : null,
        video_url: video_url || null, virtual_tour_url: virtual_tour_url || null,
        cadastral_reference: cadastral_reference || null, owner: owner || null,
        second_owner: second_owner || null, has_keys: has_keys || false,
        key_reference: key_reference || null, sign_on_property: sign_on_property || false,
        ibi: ibi ? parseFloat(ibi) : null, agreement_type: agreement_type || null,
        agreement_from: agreement_from || null, agreement_to: agreement_to || null,
        commission_percentage: commission_percentage ? parseFloat(commission_percentage) : null,
        commission_value: commission_value ? parseFloat(commission_value) : null,
        shared_commission_pct: shared_commission_pct ? parseFloat(shared_commission_pct) : null,
        terrace_area: terrace_area ? parseFloat(terrace_area) : null,
        garage_area: garage_area ? parseFloat(garage_area) : null,
        garage_price: garage_price ? parseFloat(garage_price) : null,
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
      .select('url, storage_path')
      .eq('property_id', req.params.id);

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', req.params.id)
      .eq('user_email', req.user.email);

    if (error) return res.status(500).json({ error: error.message });

    if (photos && photos.length > 0) {
      const paths = photos
        .map(p => p.storage_path || (p.url && p.url.includes('/property-photos/') ? p.url.split('/property-photos/')[1] : null))
        .filter(Boolean);
      if (paths.length > 0) await supabase.storage.from(STORAGE_BUCKET).remove(paths);
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

    const records = [];
    for (let index = 0; index < req.files.length; index++) {
      const file = req.files[index];
      const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(file.originalname);
      const ext = path.extname(file.originalname);
      const storagePath = `${req.params.id}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });

      if (uploadError) {
        console.error('Storage upload error:', uploadError.message);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      records.push({
        property_id: req.params.id,
        url: publicUrl,
        filename: file.originalname,
        is_primary: !hasExisting && index === 0 && !isVideo,
        media_type: isVideo ? 'video' : 'photo',
        sort_order: nextOrder + index,
        storage_path: storagePath
      });
    }

    if (records.length === 0) return res.status(500).json({ error: 'Error al subir archivos a Supabase Storage' });

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
      // Borrar de Supabase Storage (storage_path nuevo) o derivar la ruta de la URL (fotos antiguas)
      const storagePath = photo.storage_path ||
        (photo.url && photo.url.includes('/property-photos/') ? photo.url.split('/property-photos/')[1] : null);
      if (storagePath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      }
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

// PUT editar usuario completo (solo administrador)
app.put('/api/v1/users/:id', verifyToken, requireRole('administrador'), async (req, res) => {
  const { nombre, apellidos, email, cargo, ubicacion_oficina, role, password } = req.body;
  if (!nombre || !apellidos || !email || !cargo || !ubicacion_oficina || !role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const updateData = { nombre, apellidos, email, cargo, ubicacion_oficina, role };
    if (password && password.trim()) updateData.password = password;
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select('id, email, nombre, apellidos, cargo, ubicacion_oficina, role, created_at');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, user: data[0] });
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

// ── Website Builder ──────────────────────────────────────
// GET configuración propia
app.get('/api/v1/website/settings', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
    if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
    res.json({ settings: data || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT guardar configuración
app.put('/api/v1/website/settings', verifyToken, async (req, res) => {
  const { template, primaryColor, accentColor, companyName, tagline, description,
    phone, whatsapp, email, address, slug, showPrices, published, instagram, facebook } = req.body;

  if (slug) {
    // Verificar que el slug no esté ocupado por otro usuario
    const { data: existing } = await supabase
      .from('website_settings')
      .select('user_id')
      .eq('slug', slug)
      .neq('user_id', req.user.id)
      .single();
    if (existing) return res.status(400).json({ error: 'Esa URL ya está en uso, elige otra' });
  }

  try {
    const payload = {
      user_id: req.user.id, template, primary_color: primaryColor, accent_color: accentColor,
      company_name: companyName, tagline, description, phone, whatsapp, email, address,
      slug, show_prices: showPrices, published: published || false,
      instagram, facebook, updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('website_settings')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    // Devolver en camelCase
    const s = data;
    res.json({ success: true, settings: {
      template: s.template, primaryColor: s.primary_color, accentColor: s.accent_color,
      companyName: s.company_name, tagline: s.tagline, description: s.description,
      phone: s.phone, whatsapp: s.whatsapp, email: s.email, address: s.address,
      slug: s.slug, showPrices: s.show_prices, published: s.published,
      instagram: s.instagram, facebook: s.facebook
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET página pública por slug (sin auth)
app.get('/api/public/website/:slug', async (req, res) => {
  try {
    const { data: ws, error } = await supabase
      .from('website_settings')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .single();
    if (error || !ws) return res.status(404).json({ error: 'Página no encontrada' });

    const { data: props } = await supabase
      .from('properties')
      .select('id,title,price,city,province,property_type,transaction_type,bedrooms,bathrooms,square_meters,estado')
      .eq('company_name', ws.company_name)
      .in('estado', ['disponible', 'reservado'])
      .order('created_at', { ascending: false })
      .limit(24);

    res.json({
      settings: {
        template: ws.template, primaryColor: ws.primary_color, accentColor: ws.accent_color,
        companyName: ws.company_name, tagline: ws.tagline, description: ws.description,
        phone: ws.phone, whatsapp: ws.whatsapp, email: ws.email, address: ws.address,
        showPrices: ws.show_prices, instagram: ws.instagram, facebook: ws.facebook
      },
      properties: props || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PORTALES ────────────────────────────────────────────────────────────

const PORTALS = ['idealista', 'fotocasa', 'pisos', 'habitaclia'];
const crypto = require('crypto');

// GET credenciales de todos los portales del usuario
app.get('/api/v1/portals/credentials', verifyToken, async (req, res) => {
  try {
    const { data } = await supabase
      .from('portal_credentials')
      .select('portal, enabled, feed_token, api_key, api_secret')
      .eq('user_email', req.user.email);
    const masked = (data || []).map(c => ({
      ...c,
      api_key: c.api_key ? '••••' + c.api_key.slice(-4) : '',
      api_secret: c.api_secret ? '••••' : '',
    }));
    res.json({ credentials: masked });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT credenciales de un portal
app.put('/api/v1/portals/credentials/:portal', verifyToken, async (req, res) => {
  const { portal } = req.params;
  if (!PORTALS.includes(portal)) return res.status(400).json({ error: 'Portal no válido' });
  const { api_key, api_secret, enabled } = req.body;
  try {
    const { data: existing } = await supabase
      .from('portal_credentials').select('feed_token').eq('user_email', req.user.email).eq('portal', portal).single();
    const feed_token = existing?.feed_token || crypto.randomBytes(20).toString('hex');
    const { error } = await supabase.from('portal_credentials').upsert({
      user_email: req.user.email, portal,
      api_key: api_key || '', api_secret: api_secret || '',
      enabled: enabled ?? true, feed_token
    }, { onConflict: 'user_email,portal' });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, feed_token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET estado de portales para todas las propiedades del usuario
app.get('/api/v1/portals/status', verifyToken, async (req, res) => {
  try {
    const { data: props } = await supabase.from('properties').select('id').eq('user_email', req.user.email);
    const ids = (props || []).map(p => p.id);
    if (!ids.length) return res.json({ statuses: {} });
    const { data } = await supabase.from('property_portals').select('property_id, portal, status').in('property_id', ids);
    const statuses = {};
    (data || []).forEach(s => {
      if (!statuses[s.property_id]) statuses[s.property_id] = {};
      statuses[s.property_id][s.portal] = s.status;
    });
    res.json({ statuses });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST activar/desactivar propiedad en un portal
app.post('/api/v1/portals/:portal/properties/:propertyId', verifyToken, async (req, res) => {
  const { portal, propertyId } = req.params;
  if (!PORTALS.includes(portal)) return res.status(400).json({ error: 'Portal no válido' });
  const { active } = req.body;
  try {
    const { error } = await supabase.from('property_portals').upsert({
      property_id: propertyId, portal,
      status: active ? 'active' : 'inactive',
      last_synced: active ? new Date().toISOString() : null,
      error_msg: null
    }, { onConflict: 'property_id,portal' });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Helpers XML ──────────────────────────────────────────────────────────
const BASE_URL = process.env.BASE_URL || 'https://habitaclick-backend.onrender.com';

async function getActivePropertiesForFeed(token, portal) {
  const { data: cred } = await supabase.from('portal_credentials')
    .select('user_email, enabled').eq('feed_token', token).eq('portal', portal).single();
  if (!cred || !cred.enabled) return null;

  const { data: active } = await supabase.from('property_portals')
    .select('property_id').eq('portal', portal).eq('status', 'active');
  const ids = (active || []).map(p => p.property_id);
  if (!ids.length) return { user_email: cred.user_email, properties: [] };

  const [{ data: props }, { data: photos }] = await Promise.all([
    supabase.from('properties').select('*').eq('user_email', cred.user_email).in('id', ids),
    supabase.from('property_photos').select('*').in('property_id', ids)
      .eq('media_type', 'photo').order('sort_order', { ascending: true }),
  ]);
  const photoMap = {};
  (photos || []).forEach(ph => {
    if (!photoMap[ph.property_id]) photoMap[ph.property_id] = [];
    photoMap[ph.property_id].push(ph);
  });
  const properties = (props || []).map(p => ({ ...p, photos: photoMap[p.id] || [] }));
  return { user_email: cred.user_email, properties };
}

// ── Feed Idealista ───────────────────────────────────────────────────────
app.get('/api/v1/feed/:token/idealista.xml', async (req, res) => {
  const result = await getActivePropertiesForFeed(req.params.token, 'idealista');
  if (!result) return res.status(403).send('Token inválido');
  const typeMap = { apartment: 'piso', house: 'chalet', land: 'terreno', commercial: 'local' };
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<proyectos>
  <proyecto nombre="HabitaClick">
    <inmuebles>
${result.properties.map(p => `      <inmueble>
        <ref><![CDATA[${p.reference || p.id}]]></ref>
        <operacion>${p.transaction_type === 'rent' ? '2' : '1'}</operacion>
        <tipo>${typeMap[p.property_type] || 'piso'}</tipo>
        <precio>${p.price || 0}</precio>
        ${p.square_meters ? `<metros>${p.square_meters}</metros>` : ''}
        ${p.bedrooms ? `<habitaciones>${p.bedrooms}</habitaciones>` : ''}
        ${p.bathrooms ? `<banos>${p.bathrooms}</banos>` : ''}
        <localizacion>
          <pais>España</pais>
          ${p.province ? `<provincia><![CDATA[${p.province}]]></provincia>` : ''}
          ${p.city ? `<municipio><![CDATA[${p.city}]]></municipio>` : ''}
          ${p.address ? `<direccion><![CDATA[${p.address}]]></direccion>` : ''}
        </localizacion>
        <descripcion><![CDATA[${p.description || ''}]]></descripcion>
        <imagenes>
          ${p.photos.slice(0, 20).map(ph => `<imagen><![CDATA[${BASE_URL}${ph.url}]]></imagen>`).join('\n          ')}
        </imagenes>
      </inmueble>`).join('\n')}
    </inmuebles>
  </proyecto>
</proyectos>`;
  res.set('Content-Type', 'application/xml; charset=UTF-8');
  res.send(xml);
});

// ── Feed Fotocasa ────────────────────────────────────────────────────────
app.get('/api/v1/feed/:token/fotocasa.xml', async (req, res) => {
  const result = await getActivePropertiesForFeed(req.params.token, 'fotocasa');
  if (!result) return res.status(403).send('Token inválido');
  const typeMap = { apartment: '1', house: '2', land: '14', commercial: '5' };
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<inmuebles>
${result.properties.map(p => `  <inmueble>
    <referencia><![CDATA[${p.reference || p.id}]]></referencia>
    <tipo_operacion>${p.transaction_type === 'rent' ? '2' : '1'}</tipo_operacion>
    <tipo_inmueble>${typeMap[p.property_type] || '1'}</tipo_inmueble>
    <precio>${p.price || 0}</precio>
    ${p.square_meters ? `<superficie_construida>${p.square_meters}</superficie_construida>` : ''}
    ${p.bedrooms ? `<hab>${p.bedrooms}</hab>` : ''}
    ${p.bathrooms ? `<ban>${p.bathrooms}</ban>` : ''}
    ${p.province ? `<provincia><![CDATA[${p.province}]]></provincia>` : ''}
    ${p.city ? `<municipio><![CDATA[${p.city}]]></municipio>` : ''}
    ${p.address ? `<direccion><![CDATA[${p.address}]]></direccion>` : ''}
    <descripcion><![CDATA[${p.description || ''}]]></descripcion>
    <imagenes>
      ${p.photos.slice(0, 20).map((ph, i) => `<imagen orden="${i + 1}"><![CDATA[${BASE_URL}${ph.url}]]></imagen>`).join('\n      ')}
    </imagenes>
  </inmueble>`).join('\n')}
</inmuebles>`;
  res.set('Content-Type', 'application/xml; charset=UTF-8');
  res.send(xml);
});

// ── Feed Pisos.com ───────────────────────────────────────────────────────
app.get('/api/v1/feed/:token/pisos.xml', async (req, res) => {
  const result = await getActivePropertiesForFeed(req.params.token, 'pisos');
  if (!result) return res.status(403).send('Token inválido');
  const typeMap = { apartment: 'piso', house: 'casa', land: 'solar', commercial: 'local' };
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<inmuebles>
${result.properties.map(p => `  <inmueble>
    <ref><![CDATA[${p.reference || p.id}]]></ref>
    <tipo>${typeMap[p.property_type] || 'piso'}</tipo>
    <operacion>${p.transaction_type === 'rent' ? 'alquiler' : 'venta'}</operacion>
    <precio>${p.price || 0}</precio>
    ${p.square_meters ? `<metros_construidos>${p.square_meters}</metros_construidos>` : ''}
    ${p.bedrooms ? `<dormitorios>${p.bedrooms}</dormitorios>` : ''}
    ${p.bathrooms ? `<banos>${p.bathrooms}</banos>` : ''}
    ${p.province ? `<provincia><![CDATA[${p.province}]]></provincia>` : ''}
    ${p.city ? `<localidad><![CDATA[${p.city}]]></localidad>` : ''}
    ${p.address ? `<direccion><![CDATA[${p.address}]]></direccion>` : ''}
    <descripcion><![CDATA[${p.description || ''}]]></descripcion>
    <fotos>
      ${p.photos.slice(0, 20).map(ph => `<foto><![CDATA[${BASE_URL}${ph.url}]]></foto>`).join('\n      ')}
    </fotos>
  </inmueble>`).join('\n')}
</inmuebles>`;
  res.set('Content-Type', 'application/xml; charset=UTF-8');
  res.send(xml);
});

// ── Feed Habitaclia ──────────────────────────────────────────────────────
app.get('/api/v1/feed/:token/habitaclia.xml', async (req, res) => {
  const result = await getActivePropertiesForFeed(req.params.token, 'habitaclia');
  if (!result) return res.status(403).send('Token inválido');
  const typeMap = { apartment: 'piso', house: 'casa', land: 'terreno', commercial: 'local_comercial' };
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<habitaclia>
  <anuncios>
${result.properties.map(p => `    <anuncio>
      <referencia><![CDATA[${p.reference || p.id}]]></referencia>
      <tipo_operacion>${p.transaction_type === 'rent' ? 'alquiler' : 'venta'}</tipo_operacion>
      <tipo_inmueble>${typeMap[p.property_type] || 'piso'}</tipo_inmueble>
      <precio>${p.price || 0}</precio>
      ${p.square_meters ? `<superficie>${p.square_meters}</superficie>` : ''}
      ${p.bedrooms ? `<habitaciones>${p.bedrooms}</habitaciones>` : ''}
      ${p.bathrooms ? `<banos>${p.bathrooms}</banos>` : ''}
      ${p.province ? `<provincia><![CDATA[${p.province}]]></provincia>` : ''}
      ${p.city ? `<poblacion><![CDATA[${p.city}]]></poblacion>` : ''}
      ${p.address ? `<direccion><![CDATA[${p.address}]]></direccion>` : ''}
      <descripcion><![CDATA[${p.description || ''}]]></descripcion>
      <fotos>
        ${p.photos.slice(0, 20).map(ph => `<foto><![CDATA[${BASE_URL}${ph.url}]]></foto>`).join('\n        ')}
      </fotos>
    </anuncio>`).join('\n')}
  </anuncios>
</habitaclia>`;
  res.set('Content-Type', 'application/xml; charset=UTF-8');
  res.send(xml);
});

// Captura errores de multer y otros no controlados
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Backend en http://localhost:${PORT}/api/v1`);
});
