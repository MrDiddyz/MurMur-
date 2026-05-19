import Link from "next/link";
import { ReactNode } from "react";

const nav = ["dashboard", "archive", "signal", "council"];

export function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-wide text-murmur-gold">MurMur Core · {title}</h1>
        <nav className="flex gap-3 text-sm text-zinc-300">
          {nav.map((item) => (
            <Link className="capitalize hover:text-murmur-gold" href={`/${item}`} key={item}>
              {item}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </main>
  );
}
