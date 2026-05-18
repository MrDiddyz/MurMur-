import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/reflection', label: 'Reflect' },
  { href: '/constellation', label: 'Constellation' },
  { href: '/review', label: 'Review' },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-night/80 backdrop-blur-md">
      <div className="shell flex h-14 items-center justify-between">
        <Link href="/" className="text-sm font-bold tracking-widest text-mirror">
          MURMUR LAB
        </Link>
        <ul className="flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-lg px-3 py-1.5 text-sm text-ink hover:bg-white/[0.06] hover:text-white"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
