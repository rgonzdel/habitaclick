import { notFound } from 'next/navigation';

// BORRADOR: completar con los datos reales del titular y revisar con un profesional antes de publicar.
const PAGES: Record<string, { title: string; body: string[] }> = {
  privacidad: {
    title: 'Política de privacidad',
    body: [
      'Responsable del tratamiento: [razón social y NIF del titular], con domicilio en [dirección] y contacto en [correo de privacidad].',
      'Tratamos los datos de registro, los anuncios que publicas y los mensajes de contacto para prestar el servicio de portal de anuncios, gestionar pagos y atender consultas.',
      'Las comunicaciones comerciales y las alertas por email solo se envían si las has aceptado, y puedes darte de baja en cualquier momento.',
      'Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo al correo de contacto.',
    ],
  },
  cookies: {
    title: 'Política de cookies',
    body: [
      'Usamos almacenamiento técnico necesario para mantener tu sesión iniciada.',
      'Si en el futuro se añaden cookies de analítica o publicidad, se pedirá tu consentimiento antes de activarlas.',
    ],
  },
  'aviso-legal': {
    title: 'Aviso legal',
    body: [
      'Titular del sitio: [razón social, NIF, domicilio y datos de inscripción registral].',
      'Habitaclick es una plataforma de publicación de anuncios de terceros. No interviene en las operaciones entre anunciante y usuario, y cada anunciante es responsable del contenido que publica.',
    ],
  },
};

export default function Legal({ params }: { params: { slug: string } }) {
  const p = PAGES[params.slug];
  if (!p) notFound();
  return (
    <div className="container narrow-lg prose">
      <h1>{p.title}</h1>
      {p.body.map((t, i) => (
        <p key={i}>{t}</p>
      ))}
    </div>
  );
}
