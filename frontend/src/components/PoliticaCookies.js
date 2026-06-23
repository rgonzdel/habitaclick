import React from 'react';

const PoliticaCookies = () => {
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
    cookieType: {
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
        <h1 style={styles.heading}>Política de Cookies</h1>
        <p><strong>Empresa:</strong> HABITACLICK</p>
        <p><strong>Sitio Web:</strong> habitaclick.es</p>
        <p><strong>Última actualización:</strong> Junio 2026</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>1. Definición y Descripción de Cookies</h2>
        <p>Una cookie es un fichero de pequeño tamaño que se almacena en el dispositivo del usuario (ordenador, tablet, smartphone, etc.) cuando accede a determinadas páginas web. Las cookies permiten almacenar información del usuario y recuperarla cuando visita nuevamente la página web.</p>
        <p>Las cookies utilizadas en habitaclick.es se ajustan a la definición establecida en el <strong>Reglamento (UE) 2016/679 del Parlamento Europeo (RGPD)</strong>, la <strong>Ley 34/1988, de 11 de noviembre, de Regulación de la Publicidad de Servicios de la Sociedad de la Información (LSSI)</strong>, y la <strong>Ley 3/1991, de 10 de enero, sobre Seguridad de Sistemas de Información (LSSE)</strong>.</p>
        <div style={styles.legalReference}>
          Fundamento Legal: Artículos 4.11 y 6 del RGPD; Artículo 6 de la LSSI
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>2. Tipos de Cookies Utilizadas</h2>
        <p>En habitaclick.es utilizamos diferentes tipos de cookies clasificadas según su naturaleza, finalidad y duración:</p>

        <h3 style={styles.heading}>2.1. Según la Duración</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{...styles.td, ...styles.cookieType}}><strong>Cookies de Sesión</strong></td>
              <td style={styles.td}>Se eliminan automáticamente cuando el usuario cierra el navegador.</td>
              <td style={styles.td}>Durante la sesión activa</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.cookieType}}><strong>Cookies Persistentes</strong></td>
              <td style={styles.td}>Se almacenan en el dispositivo del usuario hasta que expiran o son eliminadas manualmente.</td>
              <td style={styles.td}>Según se especifique (máximo 24 meses)</td>
            </tr>
          </tbody>
        </table>

        <h3 style={styles.heading}>2.2. Según la Procedencia</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{...styles.td, ...styles.cookieType}}><strong>Cookies Propias</strong></td>
              <td style={styles.td}>Establecidas por habitaclick.es para controlar el funcionamiento de la plataforma.</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.cookieType}}><strong>Cookies de Terceros</strong></td>
              <td style={styles.td}>Establecidas por terceros colaboradores (analítica, publicidad, etc.) en el dominio de habitaclick.es.</td>
            </tr>
          </tbody>
        </table>

        <h3 style={styles.heading}>2.3. Según su Finalidad</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Categoría</th>
              <th style={styles.th}>Finalidad</th>
              <th style={styles.th}>Cookies Asociadas</th>
              <th style={styles.th}>Consentimiento Requerido</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{...styles.td, ...styles.cookieType}}><strong>Técnicas</strong></td>
              <td style={styles.td}>Esenciales para el funcionamiento del sitio web. Permiten navegar, usar funciones básicas y acceder a áreas seguras.</td>
              <td style={styles.td}>session_id, auth_token, csrf_token, lang_preference</td>
              <td style={styles.td}>No (Artículo 6.1.a RGPD)</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.cookieType}}><strong>De Preferencia</strong></td>
              <td style={styles.td}>Recordar las preferencias del usuario (idioma, región, configuración de accesibilidad).</td>
              <td style={styles.td}>user_preferences, theme_mode, accessibility_settings</td>
              <td style={styles.td}>Consentimiento (Artículo 6.1.a RGPD)</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.cookieType}}><strong>Analíticas</strong></td>
              <td style={styles.td}>Analizar el uso del sitio web, rendimiento, patrones de navegación y mejora de la experiencia de usuario.</td>
              <td style={styles.td}>_ga, _gid, _gat (Google Analytics)</td>
              <td style={styles.td}>Consentimiento (Artículo 6.1.a RGPD)</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.cookieType}}><strong>Publicitarias</strong></td>
              <td style={styles.td}>Mostrar publicidad personalizada según los intereses del usuario.</td>
              <td style={styles.td}>ad_preferences, tracking_id</td>
              <td style={styles.td}>Consentimiento (Artículo 6.1.a RGPD)</td>
            </tr>
            <tr>
              <td style={{...styles.td, ...styles.cookieType}}><strong>De Marketing</strong></td>
              <td style={styles.td}>Seguimiento de campañas publicitarias y medir la efectividad.</td>
              <td style={styles.td}>fbp, _fbp (Facebook Pixel), utm_source, utm_campaign</td>
              <td style={styles.td}>Consentimiento (Artículo 6.1.a RGPD)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>3. Cookies Técnicas (Consentimiento no Requerido)</h2>
        <p>Las siguientes cookies son técnicamente necesarias para el funcionamiento de habitaclick.es y se consideran exentas de solicitar consentimiento previo según el RGPD:</p>
        <ul>
          <li><strong>session_id:</strong> Identifica la sesión del usuario en el servidor.</li>
          <li><strong>auth_token:</strong> Mantiene la autenticación del usuario en la plataforma.</li>
          <li><strong>csrf_token:</strong> Protege contra ataques Cross-Site Request Forgery.</li>
          <li><strong>lang_preference:</strong> Almacena el idioma seleccionado por el usuario.</li>
        </ul>
        <div style={styles.legalReference}>
          Fundamento Legal: Artículo 6.1.b RGPD (cumplimiento del contrato) y Considerando 32 (cookies técnicas esenciales)
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>4. Cookies que Requieren Consentimiento</h2>
        <p>Las siguientes categorías de cookies requieren el consentimiento previo, explícito e informado del usuario antes de ser almacenadas:</p>
        
        <h3 style={styles.heading}>4.1. Cookies Analíticas</h3>
        <p>Utilizamos Google Analytics para medir el tráfico de la plataforma y entender cómo los usuarios interactúan con nuestros servicios.</p>
        <ul>
          <li><strong>Proveedor:</strong> Google LLC</li>
          <li><strong>Finalidad:</strong> Análisis de uso, métricas de rendimiento, comportamiento del usuario</li>
          <li><strong>Duración:</strong> Hasta 24 meses</li>
          <li><strong>Más información:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
        </ul>

        <h3 style={styles.heading}>4.2. Cookies de Marketing</h3>
        <p>Utilizamos tecnologías de seguimiento para medir la efectividad de nuestras campañas publicitarias.</p>
        <ul>
          <li><strong>Proveedor:</strong> Facebook, Google Ads, LinkedIn</li>
          <li><strong>Finalidad:</strong> Seguimiento de conversiones, retargeting, análisis de campañas</li>
          <li><strong>Duración:</strong> Hasta 24 meses</li>
        </ul>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>5. Control y Gestión de Cookies</h2>
        <p>El usuario tiene derecho a permitir, rechazar o eliminar las cookies utilizadas en habitaclick.es en cualquier momento:</p>

        <h3 style={styles.heading}>5.1. A Través de Nuestro Sitio Web</h3>
        <p>Habitaclick.es proporciona un modal de consentimiento de cookies en el primer acceso del usuario. El usuario puede:</p>
        <ul>
          <li><strong>Aceptar todas las cookies:</strong> Permitir todas las categorías de cookies.</li>
          <li><strong>Personalizar preferencias:</strong> Seleccionar qué categorías acepta.</li>
          <li><strong>Rechazar no esenciales:</strong> Rechazar todas excepto cookies técnicas.</li>
        </ul>

        <h3 style={styles.heading}>5.2. A Través del Navegador</h3>
        <p>El usuario puede gestionar las cookies directamente desde las configuraciones de su navegador:</p>
        <ul>
          <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y Seguridad &gt; Cookies y otros datos de sitios</li>
          <li><strong>Mozilla Firefox:</strong> Opciones &gt; Privacidad y Seguridad &gt; Cookies y datos del sitio</li>
          <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Cookies y datos del sitio web</li>
          <li><strong>Microsoft Edge:</strong> Configuración &gt; Privacidad &gt; Cookies y otros datos del sitio</li>
        </ul>

        <h3 style={styles.heading}>5.3. Opt-Out de Cookies Analíticas</h3>
        <p>El usuario puede optar por no participar en Google Analytics utilizando el <strong>Google Analytics Opt-out Browser Add-on</strong>: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">https://tools.google.com/dlpage/gaoptout</a></p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>6. Cookies de Terceros</h2>
        <p>Algunos servicios de terceros utilizados en habitaclick.es pueden establecer sus propias cookies:</p>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Servicio</th>
              <th style={styles.th}>Finalidad</th>
              <th style={styles.th}>Política de Privacidad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}><strong>Google Analytics</strong></td>
              <td style={styles.td}>Análisis de tráfico y comportamiento del usuario</td>
              <td style={styles.td}><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">google.com/privacy</a></td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Stripe</strong></td>
              <td style={styles.td}>Procesamiento de pagos</td>
              <td style={styles.td}><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Facebook Pixel</strong></td>
              <td style={styles.td}>Seguimiento de conversiones en publicidad</td>
              <td style={styles.td}><a href="https://www.facebook.com/privacy" target="_blank" rel="noopener noreferrer">facebook.com/privacy</a></td>
            </tr>
            <tr>
              <td style={styles.td}><strong>LinkedIn Insight Tag</strong></td>
              <td style={styles.td}>Análisis de campañas B2B</td>
              <td style={styles.td}><a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">linkedin.com/legal/privacy-policy</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>10. Derechos del Usuario</h2>
        <p>Conforme al RGPD, el usuario tiene los siguientes derechos relativos a sus datos tratados mediante cookies:</p>
        <ul>
          <li><strong>Derecho de Acceso (Art. 15):</strong> Solicitar información sobre qué datos se almacenan mediante cookies.</li>
          <li><strong>Derecho de Rectificación (Art. 16):</strong> Corregir datos inexactos.</li>
          <li><strong>Derecho al Olvido (Art. 17):</strong> Solicitar la eliminación de datos asociados a cookies.</li>
          <li><strong>Derecho a Limitar el Tratamiento (Art. 18):</strong> Restringir el uso de cookies.</li>
          <li><strong>Derecho a la Portabilidad (Art. 20):</strong> Obtener los datos en un formato estructurado.</li>
          <li><strong>Derecho a Oponersse (Art. 21):</strong> Oponerse al tratamiento para fines de marketing directo.</li>
        </ul>
        <p>Para ejercer estos derechos, el usuario puede contactar a: <strong>privacy@habitaclick.es</strong></p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>11. Contacto</h2>
        <p><strong>HABITACLICK</strong></p>
        <ul>
          <li><strong>Email Privacidad:</strong> privacy@habitaclick.es</li>
          <li><strong>Email Soporte:</strong> soporte@habitaclick.es</li>
          <li><strong>Sitio Web:</strong> https://habitaclick.es</li>
        </ul>
      </div>

      <div style={{...styles.section, ...styles.footer}}>
        <p>
          <strong>Esta Política de Cookies ha sido elaborada conforme a la normativa española e internacional aplicable, incluyendo el RGPD (UE 2016/679), LSSI-CE (Ley 34/1988) y LSSE (Ley 3/1991).</strong>
        </p>
      </div>
    </div>
  );
};

export default PoliticaCookies;
