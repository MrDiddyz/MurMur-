import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { AnalyticsPlaceholder } from '@/components/analytics-placeholder';
import { getSiteUrl } from '@/lib/site';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'MURMUR : A Learning Constellation',
  description:
    'Skreddersydde læringsmoduler for selskaper og individer. Strategisk, kreativt og operativt designet for varig effekt.',
  openGraph: {
    title: 'MURMUR : A Learning Constellation',
    description: 'Tailored modules for companies, individuals, and non-clinical wellbeing support.',
    url: siteUrl,
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
