import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/format';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/cuenta', '/publicar', '/destacar', '/acceso', '/restablecer'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
