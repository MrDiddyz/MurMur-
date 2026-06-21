import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-panel p-4 shadow-luxe sm:p-5">
      {children}
    </section>
  );
}
