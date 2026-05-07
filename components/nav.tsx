import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Nav({ email }: { email?: string }) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-obsidian/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full border border-champagne/30 bg-champagne/10 text-champagne">M</span>
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-mercury">MurMur</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm text-smoke">
          <Link className="hidden hover:text-champagne sm:inline" href="/dashboard">Dashboard</Link>
          {email ? (
            <form action="/auth/signout" method="post" className="flex items-center gap-3">
              <span className="hidden max-w-48 truncate md:inline">{email}</span>
              <Button variant="secondary" className="h-9 px-4">Sign out</Button>
            </form>
          ) : (
            <Link href="/login"><Button className="h-9 px-4">Sign in</Button></Link>
          )}
        </nav>
      </div>
    </header>
  );
}
