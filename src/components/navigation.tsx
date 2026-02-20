import Link from 'next/link';

const links = [
  ['Hjem', '/'],
  ['Løsninger', '/solutions/companies'],
  ['Moduler', '/modules'],
  ['Wellbeing', '/wellbeing'],
  ['Priser', '/pricing'],
  ['Om', '/about'],
  ['Kontakt', '/contact'],
] as const;

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-night/80 backdrop-blur-lg">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-[0.2em] text-white">
          MURMUR
        </Link>
        <nav className="hidden gap-6 text-sm text-ink md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="rounded-full border border-accent/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-accent/20"
        >
          Book call
        </Link>
      </div>
    </header>
  );
}
