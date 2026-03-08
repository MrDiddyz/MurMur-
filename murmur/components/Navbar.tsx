import Link from 'next/link';
import WalletButton from './WalletButton';

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">Murmur</Link>
          <Link href="/generate">Generate</Link>
          <Link href="/marketplace">Marketplace</Link>
        </div>
        <WalletButton />
      </nav>
    </header>
  );
}
