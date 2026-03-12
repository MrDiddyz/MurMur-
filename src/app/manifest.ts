import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MurMur Archive Vault',
    short_name: 'MurMur Vault',
    description: 'Turn archive chaos into structured, buildable projects.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070707',
    theme_color: '#070707',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
      { src: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  };
}
