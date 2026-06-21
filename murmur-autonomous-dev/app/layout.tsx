import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Murmur Autonomous Dev',
  description: 'Run and monitor autonomous development jobs'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
