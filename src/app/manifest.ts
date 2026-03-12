import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MurMur Mobile Workspace',
    short_name: 'MurMur',
    description: 'Mobile-first workspace for vaults, project fragments, and agent notes.',
    start_url: '/murmur-aicore/app/dashboard',
    display: 'standalone',
    background_color: '#05070f',
    theme_color: '#05070f',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
