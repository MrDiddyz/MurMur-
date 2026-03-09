import Link from 'next/link';

const links = [
  { href: '/create', label: 'Create' },
  { href: '/library', label: 'Publish' },
  { href: '/sell', label: 'Sell' }
];

export function Navbar() {
  return (
    <header className="border-b border-slate-800/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          MurMur
        </Link>
        <ul className="flex items-center gap-6 text-sm text-slate-300">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
