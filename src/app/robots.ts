import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Allow AI crawlers access to public content (GEO)
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: '/api/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: '/api/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: '/api/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
