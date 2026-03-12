'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const appLinks = [
  { href: '/murmur-aicore/app/dashboard', label: 'Dashboard' },
  { href: '/murmur-aicore/app/vaults', label: 'Vaults' },
  { href: '/murmur-aicore/app/fragments', label: 'Fragments' },
  { href: '/murmur-aicore/app/agent-notes', label: 'Notes' },
  { href: '/murmur-aicore/app/export', label: 'Export' },
] as const;

function getLinkClass(isActive: boolean, compact = false) {
  const base = compact
    ? 'block rounded-lg border px-2 py-2'
    : 'rounded-full border px-3 py-1.5';
  const active = isActive
    ? 'border-cyan-300/80 bg-cyan-500/10 text-cyan-100'
    : 'border-white/10 text-slate-300 hover:border-cyan-300/60 hover:text-cyan-100';

  return `${base} ${active}`;
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#050912]/95 px-2 pb-2 pt-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5 gap-2 text-center text-[10px] uppercase tracking-[0.1em]">
        {appLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <li key={link.href}>
              <Link href={link.href} className={getLinkClass(isActive, true)} aria-current={isActive ? 'page' : undefined}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden rounded-xl border border-white/10 bg-black/30 p-3 md:block">
      <ul className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em]">
        {appLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <li key={link.href}>
              <Link href={link.href} className={getLinkClass(isActive)} aria-current={isActive ? 'page' : undefined}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
