import '../styles/globals.css';
import { StateBusProvider } from '../core/stateBus';

export const metadata = {
  title: 'MurmurLayer',
  description: 'A stylized audio mixing workspace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="leopard-bg" aria-hidden="true" />
        <StateBusProvider>{children}</StateBusProvider>
      </body>
    </html>
  );
}
