export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-24 md:px-10 lg:py-32">
        <p className="w-fit rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1 text-sm font-medium text-cyan-200">
          Built for modern security teams
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Detect and resolve incidents faster with MurMur.
        </h1>
        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
          MurMur combines real-time telemetry, contextual alerts, and workflow automation so your
          team can spend less time chasing noise and more time closing critical threats.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
            Start free trial
          </button>
          <button className="rounded-lg border border-slate-600 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-400">
            View demo
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-16 top-12 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
    </section>
  );
}
