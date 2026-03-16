import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { BottomNav } from '@/components/vault/bottom-nav';
import { PwaRegister } from '@/components/vault/pwa-register';

export const metadata: Metadata = {
  title: 'MurMur Archive Vault',
  description: 'Turn archive chaos into structured, buildable projects.',
  applicationName: 'MurMur Archive Vault',
  appleWebApp: {
    capable: true,
    title: 'MurMur Vault',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: '/icon-192.svg', type: 'image/svg+xml' }, { url: '/icon-512.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#070707',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
