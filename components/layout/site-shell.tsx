import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/council', label: 'Council' },
  { href: '/archive', label: 'Archive' },
] as const;

export function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
      <header className="flex items-center justify-between border-b border-line pb-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          MurMur
        </Link>
        <nav className="flex gap-4 text-sm text-muted">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="flex flex-1 flex-col py-10">{children}</div>
    </main>
  );
}
