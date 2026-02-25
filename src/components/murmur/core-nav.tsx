import Link from 'next/link';

const links = [
  { href: '/murmur-aicore', label: 'Landing' },
  { href: '/murmur-aicore/how-it-works', label: 'How it works' },
  { href: '/murmur-aicore/learning-path', label: 'Learning Path' },
  { href: '/murmur-aicore/pricing', label: 'Membership' },
  { href: '/murmur-aicore/app/dashboard', label: 'Member Area' },
  { href: '/murmur-aicore/build-order', label: 'Build Order' },
];

export function MurmurCoreNav() {
  return (
    <nav className="sticky top-16 z-20 rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur">
      <ul className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.14em] text-slate-200">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="rounded-full border border-white/10 px-3 py-1.5 hover:border-cyan-300/80 hover:text-cyan-200">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
