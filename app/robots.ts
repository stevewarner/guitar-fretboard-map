import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/chord/new', '/print'],
    },
    sitemap: 'https://www.guitartheory.app/sitemap.xml',
  };
}
