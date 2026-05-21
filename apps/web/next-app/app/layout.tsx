import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Analytics } from '@vercel/analytics/react';


export const viewport: Viewport = {
  themeColor: '#05070f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://murmur-learning-lab.example.com'),
  title: 'Murmur Learning Lab',
  description:
    'Human-centered AI learning and reflection lab built with Next.js and Supabase.',
  openGraph: {
    title: 'Murmur Learning Lab',
    description: 'Write reflections, receive guidance, and grow a learning constellation.',
    url: 'https://murmur-learning-lab.example.com',
    siteName: 'Murmur Learning Lab',
    type: 'website',
  },
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="no">
      <body>
        <Navigation />
        <main className="container-shell pt-16">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
