import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MurMur Signal Audit Generator',
  description: 'Premium AI-generated local business signal audits with action plans and PDF export.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
