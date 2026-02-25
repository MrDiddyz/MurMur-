export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center">
      <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-sm text-cyan-200">
        Security Training for Real Teams
      </p>
      <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
        Build a Human Firewall with MurMur
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
        Turn security awareness into a habit. MurMur delivers adaptive lessons,
        phishing simulations, and behavior insights your team will actually use.
      </p>
      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
        <button className="rounded-lg bg-cyan-500 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-400">
          Start Free Trial
        </button>
        <button className="rounded-lg border border-slate-600 px-6 py-3 font-medium transition hover:border-slate-400 hover:bg-slate-900">
          Book Demo
        </button>
      </div>
    </section>
  );
}
