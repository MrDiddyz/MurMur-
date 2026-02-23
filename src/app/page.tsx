import Link from 'next/link';
import { modules } from '@/data/modules';
import { ModuleCard } from '@/components/module-card';

const pillars = [
  ['Orientation', 'Forstå hvor dere er, hva som blokkerer fremdrift, og hva som faktisk gir effekt.'],
  ['Architecture', 'Design læringsstrukturer som matcher kontekst, kapasitet og ambisjon.'],
  ['Adaptation', 'Iterer modulene i takt med endring, uten å miste retning eller kvalitet.'],
];

const duoAssistantPrinciples = [
  {
    title: 'GitHub som sannhetskilde',
    body: 'Bruk issues, branches og PR-er for å styre retning, prioriteringer og historikk i leveransen.',
  },
  {
    title: 'Copilot for tempo',
    body: 'La Copilot foreslå kode, tester og refaktorering fortløpende mens dere itererer i editoren.',
  },
  {
    title: 'Du har siste ordet',
    body: 'Alle forslag godkjennes av deg før merge: du eier kvalitet, retning og endelig beslutning.',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20 pb-8">
      <section className="space-y-8 py-10">
        <p className="text-xs uppercase tracking-[0.24em] text-accent">A Learning Constellation</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">MURMUR : A Learning Constellation</h1>
        <p className="max-w-3xl text-lg text-ink">
          Vi selger skreddersydde læringsmoduler for selskaper som trenger fart og retning, og for individer som vil bygge
          robust kapasitet i arbeid og liv.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/contact" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-night hover:opacity-90">
            Book discovery call
          </Link>
          <Link href="/modules" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold hover:border-white/50">
            Get a module recommendation
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {pillars.map(([title, body]) => (
          <article key={title} className="card">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm text-ink">{body}</p>
          </article>
        ))}
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {['Discovery & signal-mapping', 'Module architecture & scope', 'Execution with adaptive checkpoints'].map((step, i) => (
            <li key={step} className="rounded-xl border border-white/10 p-4 text-sm text-ink">
              <p className="text-xs text-accent">Steg {i + 1}</p>
              <p className="mt-2 text-white">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card">
        <p className="text-xs uppercase tracking-[0.24em] text-accent">Vibe coding collaboration</p>
        <h2 className="mt-3 text-2xl font-semibold">Samarbeid med GitHub og Copilot</h2>
        <p className="mt-3 max-w-3xl text-sm text-ink">
          Bygg en enkel vibe-coding-flyt der GitHub håndterer struktur og sporbarhet, mens Copilot hjelper med forslag i sanntid.
          Dere kan jobbe raskt med små commits, tydelige PR-er og løpende forbedringer, samtidig som du alltid bestemmer hva
          som faktisk skal inn i main.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {duoAssistantPrinciples.map((principle) => (
            <article key={principle.title} className="rounded-xl border border-white/10 bg-night/30 p-4">
              <h3 className="text-base font-semibold text-white">{principle.title}</h3>
              <p className="mt-2 text-sm text-ink">{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Module showcase</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.slice(0, 6).map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold">Case studies kommer snart</h2>
        <p className="mt-3 max-w-3xl text-sm text-ink">
          Vi publiserer konkrete resultathistorier når klienter har gitt samtykke. Inntil da deler vi metode, tempo og
          kvalitetskrav i discovery-samtalen.
        </p>
      </section>
    </div>
  );
}
