import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://murmur-constellation.example.com'),
  title: 'MURMUR | AI Art Marketplace MVP',
  description:
    'Generate AI artwork, upload metadata to IPFS, mint NFTs, and publish to the MurMur marketplace.',
  openGraph: {
    title: 'MURMUR | AI Art Marketplace MVP',
    description: 'AI-generated art with wallet minting, IPFS metadata handling, and marketplace listings.',
    url: 'https://murmur-constellation.example.com',
    siteName: 'MURMUR',
    type: 'website',
  },
  alternates: { canonical: '/' },
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
