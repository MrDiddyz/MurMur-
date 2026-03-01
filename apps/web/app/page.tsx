import {
  buildReflectionBrief,
  listCoreAgents,
  listReflectionDomains
} from "@murmur/core";

export default function HomePage() {
  const brief = buildReflectionBrief("nala-alpha");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="space-y-4">
        <p className="inline-flex rounded-full border border-aurora/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-aurora">
          Venture-Ready Intelligence Infrastructure
        </p>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          Murmur Nala Reflection OS
        </h1>
        <p className="max-w-3xl text-lg text-slate-300">
          Production foundation for autonomous reflection loops, domain-specialized
          agents, and measurable learning outcomes.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {listReflectionDomains().map((domain) => (
          <article key={domain.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-medium">{domain.name}</h2>
            <p className="mt-2 text-sm text-slate-300">{domain.objective}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-ember/40 bg-ember/10 p-6">
        <h2 className="text-xl font-semibold">Active Reflection Brief</h2>
        <p className="mt-2 text-slate-200">{brief.summary}</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Core Agent Mesh</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {listCoreAgents().map((agent) => (
            <li key={agent.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm uppercase tracking-wide text-slate-400">{agent.id}</p>
              <p className="text-lg font-medium">{agent.name}</p>
              <p className="text-sm text-slate-300">{agent.capability}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
