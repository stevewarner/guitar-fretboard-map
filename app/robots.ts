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
        // Bulk AI-training crawlers only — not the live browsing/citation
        // bots (ChatGPT-User, OAI-SearchBot, Claude-User, PerplexityBot,
        // etc.) that fetch a page in response to a real user question and
        // typically link back. Those stay allowed under the '*' rule above.
        userAgent: [
          'meta-externalagent',
          'GPTBot',
          'ClaudeBot',
          'CCBot',
          'Google-Extended',
          'Bytespider',
          'Applebot-Extended',
          'Amazonbot',
          'Diffbot',
          'ImagesiftBot',
          'omgili',
          'Ai2Bot',
          'cohere-ai',
          'Timpibot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
