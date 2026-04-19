import type { ReactNode } from 'react';

export default function MurmurAppLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl">{children}</div>;
}
