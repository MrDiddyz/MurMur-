const SUGGESTIONS = [
  'cosmic ambient AI music',
  'neural synthwave universe',
  'AI orchestral soundscape',
  'autonomous AI agents',
  'dreamlike AI art worlds',
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-amber-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.2),transparent_38%),radial-gradient(circle_at_80%_15%,rgba(250,204,21,0.15),transparent_34%),radial-gradient(circle_at_50%_80%,rgba(217,119,6,0.18),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(250,204,21,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.06)_1px,transparent_1px)] [background-size:52px_52px]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-20 sm:px-10">
        <div className="w-full rounded-3xl border border-amber-300/25 bg-black/55 p-8 shadow-[0_0_50px_rgba(250,204,21,0.12)] backdrop-blur-md sm:p-12">
          <p className="mb-4 inline-flex rounded-full border border-amber-300/40 bg-amber-200/10 px-4 py-1 text-xs uppercase tracking-[0.22em] text-amber-200">
            premium ai studio
          </p>

          <h1 className="bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 bg-clip-text text-4xl font-semibold tracking-tight text-transparent drop-shadow-[0_0_24px_rgba(250,204,21,0.35)] sm:text-6xl">
            Generate with MurMur
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-amber-100/80 sm:text-base">
            Build immersive prompts with a neon, gold-lit interface crafted for next-generation AI creators.
          </p>

          <div className="mt-10 rounded-2xl border border-amber-200/20 bg-zinc-950/90 p-4 shadow-[inset_0_0_0_1px_rgba(250,204,21,0.08),0_0_32px_rgba(250,204,21,0.08)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Describe your MurMur creation..."
                className="h-12 w-full rounded-xl border border-amber-200/20 bg-black/70 px-4 text-sm text-amber-50 placeholder:text-amber-100/40 outline-none ring-0 transition focus:border-amber-300/50 focus:shadow-[0_0_0_2px_rgba(250,204,21,0.2)]"
              />
              <button
                type="button"
                className="h-12 shrink-0 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-6 text-sm font-semibold text-black transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300/80"
              >
                Generate
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="rounded-full border border-amber-200/25 bg-amber-300/5 px-3 py-1.5 text-xs text-amber-100/85 transition hover:border-amber-300/55 hover:bg-amber-300/15"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
