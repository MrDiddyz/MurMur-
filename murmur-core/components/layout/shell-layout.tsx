import Link from "next/link";

const links = ["dashboard", "archive", "signal", "council"];

export function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen p-4 md:p-10">
      <nav className="mb-8 flex gap-4 text-sm text-zinc-300">
        {links.map((link) => (
          <Link key={link} href={`/${link}`} className="rounded border border-murmur-copper/30 px-3 py-1 capitalize hover:text-murmur-gold">
            {link}
          </Link>
        ))}
      </nav>
      {children}
    </main>
  );
}
