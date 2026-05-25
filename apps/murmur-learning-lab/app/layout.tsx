import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Nav } from '@/components/nav';

export const viewport: Viewport = {
  themeColor: '#05070f',
};

export const metadata: Metadata = {
  title: 'MurMur Learning Lab',
  description: 'A human-centered AI learning and reflection lab. Write, reflect, and grow.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="shell py-10">{children}</main>
      </body>
    </html>
  );
}
