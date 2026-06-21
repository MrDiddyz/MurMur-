import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-mercury outline-none transition placeholder:text-smoke focus:border-champagne/50 focus:ring-4 focus:ring-champagne/10', className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-32 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-mercury outline-none transition placeholder:text-smoke focus:border-champagne/50 focus:ring-4 focus:ring-champagne/10', className)} {...props} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-xs font-semibold uppercase tracking-[0.24em] text-champagne/80', className)} {...props} />;
}
