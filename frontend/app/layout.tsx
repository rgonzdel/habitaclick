import './globals.css';
import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_URL } from '@/lib/format';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Habitaclick: pisos y casas en venta y alquiler', template: '%s | Habitaclick' },
  description: 'Encuentra tu próxima vivienda o publica tu anuncio. El primer anuncio de particulares es gratis.',
  openGraph: { siteName: 'Habitaclick', locale: 'es_ES', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
