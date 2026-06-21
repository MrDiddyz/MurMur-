import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-cinematic backdrop-blur', className)} {...props} />;
}
