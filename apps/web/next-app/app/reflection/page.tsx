import Link from 'next/link';
import { submitReflection } from './actions';

type ReflectionPageProps = {
  searchParams?: { error?: string };
};

export default function ReflectionPage({ searchParams }: ReflectionPageProps) {
  const error = searchParams?.error;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-12">
      <header className="card space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Reflection Lab</p>
        <h1 className="text-3xl font-semibold text-white">Write your reflection</h1>
        <p className="text-ink">
          Share what you are learning, where you feel stuck, or what you want to explore next. Keep it honest and
          specific.
        </p>
      </header>

      <form action={submitReflection} className="card space-y-4">
        <label htmlFor="content" className="text-sm font-medium text-white">
          Reflection
        </label>
        <textarea
          id="content"
          name="content"
          rows={10}
          minLength={20}
          required
          className="w-full rounded-xl border border-white/20 bg-black/20 p-4 text-white outline-none transition focus:border-cyan-300"
          placeholder="What happened, what did you notice, and what feels important now?"
        />
        {error ? <p className="rounded-lg border border-rose-400/50 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
          >
            Reflect with AI
          </button>
          <Link href="/" className="text-sm text-ink hover:text-white">
            Back to dashboard
          </Link>
        </div>
      </form>
    </div>
  );
}
