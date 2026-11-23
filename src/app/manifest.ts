import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'ARENAGG — Community Esports',
    short_name: 'ARENAGG',
    description: 'Find esports tournaments, register and track your registration status.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait',
    background_color: '#050b18',
    theme_color: '#071326',
    categories: ['games', 'sports', 'entertainment'],
    icons: [
      { src: '/arenagg-mark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/arenagg-mark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
