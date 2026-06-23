import React from 'react';

const PoliticaPrivacidad = () => {
  const styles = {
    container: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      lineHeight: 1.6,
      color: '#333',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      minHeight: '100vh'
    },
    documentInfo: {
      backgroundColor: '#e8f4f8',
      padding: '15px',
      borderLeft: '4px solid #2ECC71',
      marginBottom: '30px',
      borderRadius: '4px'
    },
    heading: {
      color: '#003366'
    },
    section: {
      marginBottom: '30px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      margin: '15px 0',
      border: '1px solid #ddd'
    },
    th: {
      backgroundColor: '#003366',
      color: 'white',
      border: '1px solid #ddd',
      padding: '12px',
      textAlign: 'left'
    },
    td: {
      border: '1px solid #ddd',
      padding: '12px',
      textAlign: 'left'
    },
    dataType: {
      backgroundColor: '#f5f5f5'
    },
    legalReference: {
      fontSize: '0.9em',
      color: '#666',
      fontStyle: 'italic',
      marginTop: '10px'
    },
    footer: {
      backgroundColor: '#f0f8ff',
      borderLeft: '4px solid #2ECC71',
      textAlign: 'center',
      color: '#666'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.documentInfo}>
        <h1 style={styles.heading}>Política de Privacidad y Protección de Datos Personales</h1>
        <p><strong>Empresa:</strong> HABITACLICK</p>
        <p><strong>Sitio Web:</strong> habitaclick.es</p>
        <p><strong>Modelo de Negocio:</strong> Plataforma SaaS B2B para Agencias Inmobiliarias</p>
        <p><strong>Última actualización:</strong> Junio 2026</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>1. Introducción y Objeto</h2>
        <p>HABITACLICK (en adelante, "la Empresa", "nosotros" o "el responsable del tratamiento") respeta los derechos fundamentales de protección de datos personales de todos los usuarios que acceden a habitaclick.es (en adelante, "la Plataforma"), conforme a lo establecido en:</p>
        <ul>
          <li><strong>Reglamento (UE) 2016/679</strong> del Parlamento Europeo y del Consejo, de 27 de abril de 2016 (RGPD)</li>
          <li><strong>Ley Orgánica 3/2018</strong>, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)</li>
          <li><strong>Ley 34/1988</strong>, de 11 de noviembre, de Regulación de la Publicidad de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)</li>
          <li><strong>Ley 3/1991</strong>, de 10 de enero, de Competencia Desleal</li>
          <li><strong>Ley de Seguridad de Sistemas de Información (LSSE)</strong></li>
        </ul>
        <p>Esta Política de Privacidad describe cómo HABITACLICK recopila, utiliza, protege y procesa los datos personales de los usuarios de la Plataforma.</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>2. Identidad del Responsable del Tratamiento</h2>
        <p>El responsable del tratamiento de datos personales es:</p>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Datos del Responsable</th>
              <th style={styles.th}>Información</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}><strong>Denominación Social</strong></td>
              <td style={styles.td}>HABITACLICK</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Sitio Web</strong></td>
              <td style={styles.td}>https://habitaclick.es</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Correo Electrónico Principal</strong></td>
              <td style={styles.td}>privacy@habitaclick.es</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Correo Soporte</strong></td>
              <td style={styles.td}>soporte@habitaclick.es</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Delegado de Protección de Datos (DPO)</strong></td>
              <td style={styles.td}>dpo@habitaclick.es</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>País de Operación</strong></td>
              <td style={styles.td}>España (Madrid)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>3. Categorías de Usuarios y Datos Recopilados</h2>
        <p>HABITACLICK recopila datos personales de diferentes categorías de usuarios:</p>

        <h3 style={styles.heading}>3.1. Agentes Inmobiliarios (Usuarios Principales)</h3>
        <p><strong>Definición:</strong> Profesionales de agencias inmobiliarias que utilizan la Plataforma para publicar propiedades en múltiples portales.</p>
        
        <h4 style={styles.heading}>Datos Personales Recopilados:</h4>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Categoría de Datos</th>
              <th style={styles.th}>Ejemplos</th>
              <th style={styles.th}>Obligatorio/Opcional</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos de Identificación</strong></td>
              <td style={styles.td}>Nombre, apellidos, DNI/NIF, fecha de nacimiento</td>
              <td style={styles.td}>Obligatorio</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos de Contacto</strong></td>
              <td style={styles.td}>Correo electrónico, teléfono, dirección postal</td>
              <td style={styles.td}>Obligatorio</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos Profesionales</strong></td>
              <td style={styles.td}>Número de colegiado, agencia, cargo, departamento</td>
              <td style={styles.td}>Obligatorio</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos de Acceso</strong></td>
              <td style={styles.td}>Nombre de usuario, contraseña (hasheada), tokens de autenticación</td>
              <td style={styles.td}>Obligatorio</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos de Cuenta</strong></td>
              <td style={styles.td}>Plan de suscripción, fecha de activación, estado de pago</td>
              <td style={styles.td}>Obligatorio</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos de Actividad</strong></td>
              <td style={styles.td}>Propiedades publicadas, cambios realizados, historial de acceso</td>
              <td style={styles.td}>Automático</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos Técnicos</strong></td>
              <td style={styles.td}>Dirección IP, navegador, dispositivo, sistema operativo</td>
              <td style={styles.td}>Automático</td>
            </tr>
          </tbody>
        </table>

        <h3 style={styles.heading}>3.2. Propietarios de Inmuebles</h3>
        <p><strong>Definición:</strong> Personas que ceden sus propiedades a través de una agencia inmobiliaria en la Plataforma.</p>
        
        <h4 style={styles.heading}>Datos Personales Recopilados:</h4>
        <ul>
          <li>Nombre y apellidos</li>
          <li>Correo electrónico y teléfono</li>
          <li>Dirección de las propiedades</li>
          <li>Datos de contacto preferido</li>
          <li>Información sobre el inmueble (características, precio, zona)</li>
        </ul>

        <h3 style={styles.heading}>3.3. Potenciales Clientes/Visitantes</h3>
        <p><strong>Definición:</strong> Personas interesadas en ver información de propiedades.</p>
        
        <h4 style={styles.heading}>Datos Personales Recopilados:</h4>
        <ul>
          <li>Correo electrónico (si se suscribe al newsletter)</li>
          <li>Datos de navegación y preferencias de búsqueda</li>
          <li>Información técnica y de dispositivo</li>
        </ul>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>4. Bases Jurídicas para el Tratamiento de Datos</h2>
        <p>El tratamiento de datos personales en HABITACLICK se fundamenta en las siguientes bases legales:</p>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Base Jurídica</th>
              <th style={styles.th}>Aplicable a</th>
              <th style={styles.th}>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Artículo 6.1.b RGPD</strong></td>
              <td style={styles.td}>Todos los usuarios</td>
              <td style={styles.td}>Ejecución del contrato de prestación de servicios. Necesario para acceder y utilizar la Plataforma.</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Artículo 6.1.a RGPD</strong></td>
              <td style={styles.td}>Datos de contacto adicionales</td>
              <td style={styles.td}>Consentimiento explícito del usuario (newsletter, marketing, análisis).</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Artículo 6.1.c RGPD</strong></td>
              <td style={styles.td}>Cumplimiento legal</td>
              <td style={styles.td}>Obligaciones legales (facturación, impuestos, seguridad).</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Artículo 6.1.f RGPD</strong></td>
              <td style={styles.td}>Intereses legítimos</td>
              <td style={styles.td}>Seguridad, prevención de fraude, análisis de negocio, mejora de servicios.</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Artículo 9.2.a RGPD</strong></td>
              <td style={styles.td}>Datos sensibles (si aplica)</td>
              <td style={styles.td}>Consentimiento explícito para categorías especiales de datos.</td>
            </tr>
          </tbody>
        </table>

        <h3 style={styles.heading}>Consentimiento para Marketing</h3>
        <p>Para actividades de marketing directo (correos, SMS, notificaciones push), HABITACLICK obtiene consentimiento previo, explícito e informado conforme a la <strong>LSSI-CE (Artículos 20-21)</strong>.</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>5. Finalidades del Tratamiento</h2>
        <p>Los datos personales se tratan con las siguientes finalidades:</p>

        <h3 style={styles.heading}>5.1. Finalidades Esenciales (Artículo 6.1.b RGPD)</h3>
        <ul>
          <li><strong>Prestación del Servicio:</strong> Acceso a la Plataforma, creación de cuenta, autenticación.</li>
          <li><strong>Gestión del Contrato:</strong> Procesamiento de suscripciones, facturación, emisión de facturas.</li>
          <li><strong>Soporte Técnico:</strong> Resolución de incidencias, atención al cliente, respuesta a consultas.</li>
          <li><strong>Integración con Portales:</strong> Publicación de propiedades en Idealista, Fotocasa, Tecnocasa, etc.</li>
          <li><strong>Seguridad y Autenticación:</strong> Protección contra accesos no autorizados, verificación de identidad.</li>
        </ul>

        <h3 style={styles.heading}>5.2. Finalidades de Marketing (Artículo 6.1.a RGPD - Consentimiento Requerido)</h3>
        <ul>
          <li>Envío de newsletter e información sobre nuevas funcionalidades</li>
          <li>Comunicaciones sobre promociones y ofertas especiales</li>
          <li>Invitaciones a webinars y eventos</li>
          <li>Encuestas de satisfacción y feedback</li>
          <li>Publicidad personalizada en la Plataforma</li>
        </ul>

        <h3 style={styles.heading}>5.3. Finalidades Analíticas (Artículo 6.1.a RGPD - Consentimiento Requerido)</h3>
        <ul>
          <li>Análisis de uso de la Plataforma (Google Analytics)</li>
          <li>Mejora de la experiencia del usuario</li>
          <li>Análisis de tendencias de mercado inmobiliario</li>
          <li>Investigación y desarrollo de nuevas características</li>
        </ul>

        <h3 style={styles.heading}>5.4. Finalidades Legales (Artículo 6.1.c RGPD)</h3>
        <ul>
          <li>Cumplimiento de obligaciones fiscales y contables (Ley General Tributaria)</li>
          <li>Cumplimiento de obligaciones legales de registro de datos</li>
          <li>Defensa en procedimientos legales</li>
          <li>Cumplimiento de normativa de seguridad de sistemas (LSSE)</li>
        </ul>

        <h3 style={styles.heading}>5.5. Finalidades de Interés Legítimo (Artículo 6.1.f RGPD)</h3>
        <ul>
          <li><strong>Prevención de Fraude:</strong> Detección y prevención de actividades fraudulentas, abuso de servicio.</li>
          <li><strong>Seguridad:</strong> Protección contra ciberataques, intentos de acceso no autorizados.</li>
          <li><strong>Análisis de Negocio:</strong> Estadísticas internas, informes de negocio, toma de decisiones estratégicas.</li>
          <li><strong>Retención de Datos:</strong> Auditoría, compliance, verificación de cumplimiento contractual.</li>
        </ul>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>7. Duración del Almacenamiento de Datos</h2>
        <p>Los datos personales se conservan únicamente mientras sea necesario para las finalidades para las que se recopilaron:</p>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tipo de Dato</th>
              <th style={styles.th}>Duración de Almacenamiento</th>
              <th style={styles.th}>Justificación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos de Cuenta Activa</strong></td>
              <td style={styles.td}>Mientras la suscripción esté activa</td>
              <td style={styles.td}>Necesario para prestación del servicio</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos Después de Cancelación</strong></td>
              <td style={styles.td}>6 años (según Código de Comercio)</td>
              <td style={styles.td}>Obligación de retención fiscal y contable</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Logs de Acceso/Actividad</strong></td>
              <td style={styles.td}>12 meses</td>
              <td style={styles.td}>Auditoría, seguridad, investigación de incidentes</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos Analíticos (Anonimizados)</strong></td>
              <td style={styles.td}>24 meses</td>
              <td style={styles.td}>Análisis de tendencias, reportes</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Datos de Contacto para Marketing</strong></td>
              <td style={styles.td}>Hasta revocación de consentimiento</td>
              <td style={styles.td}>Consentimiento explícito del usuario</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Cookies de Sesión</strong></td>
              <td style={styles.td}>Fin de sesión</td>
              <td style={styles.td}>Funcionamiento técnico</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.dataType}}><strong>Cookies Persistentes</strong></td>
              <td style={styles.td}>Máximo 24 meses</td>
              <td style={styles.td}>Preferencias y análisis</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>8. Destinatarios de los Datos</h2>
        <p>Los datos personales se comparten con terceros únicamente en los siguientes casos:</p>

        <h3 style={styles.heading}>8.1. Encargados del Tratamiento</h3>
        <p>Terceros que procesan datos en nombre de HABITACLICK bajo contrato (Artículo 28 RGPD):</p>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Encargado</th>
              <th style={styles.th}>Función</th>
              <th style={styles.th}>Ubicación</th>
              <th style={styles.th}>Datos Tratados</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>Supabase (PostgreSQL)</td>
              <td style={styles.td}>Almacenamiento en base de datos</td>
              <td style={styles.td}>Europa/US</td>
              <td style={styles.td}>Todos los datos (con encriptación)</td>
            </tr>
            <tr>
              <td style={styles.td}>Google Analytics</td>
              <td style={styles.td}>Análisis de tráfico</td>
              <td style={styles.td}>Estados Unidos</td>
              <td style={styles.td}>Datos técnicos y de navegación</td>
            </tr>
            <tr>
              <td style={styles.td}>Stripe</td>
              <td style={styles.td}>Procesamiento de pagos</td>
              <td style={styles.td}>Estados Unidos</td>
              <td style={styles.td}>Información de facturación y transacciones</td>
            </tr>
            <tr>
              <td style={styles.td}>Amazon SES (Email)</td>
              <td style={styles.td}>Envío de emails</td>
              <td style={styles.td}>Europa</td>
              <td style={styles.td}>Correos electrónicos, contenido de mensajes</td>
            </tr>
            <tr>
              <td style={styles.td}>Portales Inmobiliarios (APIs)</td>
              <td style={styles.td}>Publicación de propiedades</td>
              <td style={styles.td}>España</td>
              <td style={styles.td}>Datos de propiedades e inmuebles</td>
            </tr>
            <tr>
              <td style={styles.td}>Providers de Cloud (AWS/Azure)</td>
              <td style={styles.td}>Infraestructura de servidor</td>
              <td style={styles.td}>Europa</td>
              <td style={styles.td}>Datos técnicos de operación</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>10. Medidas de Seguridad</h2>
        <p>HABITACLICK implementa medidas técnicas, organizativas y legales para proteger los datos personales:</p>

        <h3 style={styles.heading}>10.1. Medidas Técnicas (Artículo 32 RGPD)</h3>
        <ul>
          <li><strong>Encriptación TLS 1.2+:</strong> Comunicación cifrada entre navegador y servidor.</li>
          <li><strong>Encriptación de Datos en Reposo:</strong> Datos almacenados en base de datos encriptada.</li>
          <li><strong>Hash de Contraseñas:</strong> Contraseñas almacenadas mediante algoritmo bcrypt con salt aleatorio.</li>
          <li><strong>Autenticación Multifactor (MFA):</strong> Disponible para cuentas de usuario.</li>
          <li><strong>Tokens de Sesión Seguros:</strong> JWT con expiración y refresh tokens.</li>
          <li><strong>CORS y CSP:</strong> Protección contra ataques XSS y CSRF.</li>
          <li><strong>Rate Limiting:</strong> Prevención de ataques de fuerza bruta.</li>
          <li><strong>WAF (Web Application Firewall):</strong> Protección contra vulnerabilidades web.</li>
          <li><strong>DDoS Protection:</strong> Mitigación de ataques distribuidos.</li>
          <li><strong>Scanning de Vulnerabilidades:</strong> Auditorías periódicas de seguridad.</li>
        </ul>

        <h3 style={styles.heading}>10.2. Medidas Organizativas</h3>
        <ul>
          <li><strong>Control de Acceso:</strong> Acceso restringido a datos personales basado en principio de mínimo privilegio.</li>
          <li><strong>Formación del Personal:</strong> Capacitación anual en protección de datos y seguridad.</li>
          <li><strong>Política de Contraseñas:</strong> Requisitos de complejidad y cambio periódico.</li>
          <li><strong>Auditorías Internas:</strong> Revisiones regulares de cumplimiento.</li>
          <li><strong>Plan de Respuesta a Incidentes:</strong> Procedimiento documentado para breaches de datos.</li>
          <li><strong>Evaluación de Impacto (DPIA):</strong> Realizada conforme a Artículo 35 RGPD.</li>
        </ul>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>11. Derechos del Usuario (Artículos 15-22 RGPD)</h2>
        <p>Conforme al RGPD y la LOPDGDD, todo usuario tiene los siguientes derechos respecto a sus datos personales:</p>

        <h3 style={styles.heading}>11.1. Derecho de Acceso (Artículo 15 RGPD)</h3>
        <p><strong>Definición:</strong> Derecho a obtener confirmación de si se tratan datos personales propios y acceso a una copia.</p>
        <p><strong>Cómo ejercerlo:</strong> Enviar solicitud a privacy@habitaclick.es con copia del DNI.</p>
        <p><strong>Plazo de Respuesta:</strong> 30 días (ampliable a 60 días por complejidad).</p>

        <h3 style={styles.heading}>11.2. Derecho de Rectificación (Artículo 16 RGPD)</h3>
        <p><strong>Definición:</strong> Derecho a corregir datos personales inexactos o incompletos.</p>
        <p><strong>Cómo ejercerlo:</strong> Modificar datos directamente en la Plataforma o contactar a privacy@habitaclick.es.</p>

        <h3 style={styles.heading}>11.3. Derecho al Olvido (Artículo 17 RGPD)</h3>
        <p><strong>Definición:</strong> Derecho a solicitar la eliminación de datos personales en determinadas circunstancias.</p>

        <h3 style={styles.heading}>11.4. Derecho a Limitar el Tratamiento (Artículo 18 RGPD)</h3>
        <p><strong>Definición:</strong> Derecho a restringir el procesamiento de datos en ciertos casos.</p>

        <h3 style={styles.heading}>11.5. Derecho a la Portabilidad (Artículo 20 RGPD)</h3>
        <p><strong>Definición:</strong> Derecho a recibir datos personales en formato estructurado, comúnmente utilizado y legible por máquina.</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>15. Contacto del Responsable del Tratamiento y Derechos de los Usuarios</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Contacto</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Responsabilidad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}><strong>Privacidad y Datos Personales</strong></td>
              <td style={styles.td}>privacy@habitaclick.es</td>
              <td style={styles.td}>Solicitudes RGPD, ejercicio de derechos, privacidad</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Delegado de Protección de Datos (DPO)</strong></td>
              <td style={styles.td}>dpo@habitaclick.es</td>
              <td style={styles.td}>Consultas sobre protección de datos, compliance</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Soporte Técnico</strong></td>
              <td style={styles.td}>soporte@habitaclick.es</td>
              <td style={styles.td}>Incidencias de seguridad, reportes de breaches</td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Sitio Web</strong></td>
              <td style={styles.td}>https://habitaclick.es</td>
              <td style={styles.td}>Centro de información sobre privacidad</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{...styles.section, ...styles.footer}}>
        <p>
          <strong>Esta Política de Privacidad ha sido elaborada conforme al RGPD (UE 2016/679), LOPDGDD (LO 3/2018), LSSI-CE (Ley 34/1988), LSSE (Ley 3/1991) y demás normas de protección de datos aplicables en España.</strong>
        </p>
      </div>
    </div>
  );
};

export default PoliticaPrivacidad;
