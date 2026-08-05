import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/app/utils/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/print'],
      },
      {
        userAgent: [
          'meta-externalagent',
          'GPTBot',
          'ClaudeBot',
          'CCBot',
          'Google-Extended',
          'Bytespider',
          'Applebot-Extended',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
