import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { AnalyticsPlaceholder } from '@/components/analytics-placeholder';

export const metadata: Metadata = {
  metadataBase: new URL('https://dj-core.example.com'),
  title: 'DJ Core - AI Music Studio',
  description: 'Lag DJ tracks med opptil 5000 bokstaver prompt, velg instrumental-modus og bygg unike låtutkast.',
  openGraph: {
    title: 'DJ Core - AI Music Studio',
    description: 'Create tracks from your own words with BPM, mood, and instrumental controls.',
    url: 'https://dj-core.example.com',
    siteName: 'DJ Core',
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
