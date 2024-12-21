import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GuitarTheory | Music Theory for Guitarists',
    short_name: 'GuitarTheory',
    description: 'Chord and Scale charts for guitar',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
