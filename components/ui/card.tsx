import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-panel/80 p-6 shadow-soft backdrop-blur ${className}`}
      {...props}
    />
  );
}
