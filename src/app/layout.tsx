import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { AnalyticsPlaceholder } from '@/components/analytics-placeholder';

export const metadata: Metadata = {
  metadataBase: new URL('https://murmur-constellation.example.com'),
  title: 'MURMUR : A Learning Constellation',
  description:
    'Skreddersydde læringsmoduler for selskaper og individer. Strategisk, kreativt og operativt designet for varig effekt.',
  openGraph: {
    title: 'MURMUR : A Learning Constellation',
    description: 'Tailored modules for companies, individuals, and non-clinical wellbeing support.',
    url: 'https://murmur-constellation.example.com',
    siteName: 'MURMUR',
    type: 'website',
  },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        <Navigation />
        <main className="container-shell pt-16">{children}</main>
        <Footer />
        <AnalyticsPlaceholder />
      </body>
    </html>
  );
}
