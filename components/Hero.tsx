import Link from 'next/link';

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="inline-flex rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-light">
        AI Creator Platform
      </p>
      <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
        Generate, publish, and monetize digital art and music in one workflow.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-slate-300">
        MurMur helps creators move from idea to revenue with AI generation, portfolio publishing, and marketplace tools.
      </p>
      <div className="mt-10 flex gap-4">
        <Link href="/create" className="rounded-lg bg-brand px-5 py-3 font-medium hover:bg-brand-dark">
          Start Creating
        </Link>
        <Link href="/sell" className="rounded-lg border border-slate-700 px-5 py-3 font-medium hover:border-slate-500">
          Sell Your Work
        </Link>
      </div>
    </section>
  );
}
