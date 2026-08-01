import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/app/utils/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/print'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
