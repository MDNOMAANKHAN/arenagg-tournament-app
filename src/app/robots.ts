import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/register/',
        '/registration/',
      ],
    },
    sitemap: 'https://arenagg.live/sitemap.xml',
    host: 'https://arenagg.live',
  };
}
