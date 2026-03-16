'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/vault', label: 'Vault' },
  { href: '/fragments', label: 'Fragments' },
  { href: '/agents', label: 'Agents' },
  { href: '/export', label: 'Export' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#8c7442]/30 bg-[#070707]/95 px-4 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-between gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`block rounded-2xl px-2 py-2 text-center text-xs font-medium transition ${
                  active
                    ? 'bg-[#b89254]/20 text-[#f5d9a8] ring-1 ring-[#b89254]/40'
                    : 'text-[#b4b4b4] hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
