type StatusTone = 'idle' | 'loading' | 'success' | 'error';

type StatusPanelProps = {
  label: string;
  tone: StatusTone;
  message: string;
};

const toneClasses: Record<StatusTone, string> = {
  idle: 'border-white/15 bg-white/[0.02] text-ink',
  loading: 'border-violet-300/50 bg-violet-500/15 text-violet-100 pulse-violet',
  success: 'border-violet-300/45 bg-violet-500/12 text-violet-100',
  error: 'border-rose-300/40 bg-rose-500/10 text-rose-100',
};

export function StatusPanel({ label, tone, message }: StatusPanelProps) {
  return (
    <article className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-2 text-sm">{message}</p>
    </article>
  );
}
