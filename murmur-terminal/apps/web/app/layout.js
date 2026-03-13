export const metadata = {
  title: 'MurMur Terminal',
  description: 'Cloud Terminal Constellation'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0b0f14', color: '#e5e7eb', fontFamily: 'Inter, sans-serif' }}>{children}</body>
    </html>
  );
}
