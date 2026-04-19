import Link from 'next/link';

const features = [
  {
    title: 'Gratis å legge ut',
    description:
      'Foreldre kan publisere annonser for barneklær uten oppstartsgebyr. Du trenger bare bilder, størrelse og pris.',
  },
  {
    title: 'Kjøp eller bytt',
    description:
      'Velg mellom vanlig salg eller direkte bytte. Perfekt når barna vokser ut av klær før sesongen er over.',
  },
  {
    title: 'Miljøvennlig utkjøring',
    description:
      'Levering samkjøres i nabolag med faste hentepunkter for å kutte utslipp og gjøre logistikk enkelt.',
  },
];

const steps = [
  'Opprett profil og verifiser adresse på under 2 minutter.',
  'Legg ut klær med bilder og velg “Selg” eller “Bytt”.',
  'Motta betaling eller godta bytteforslag direkte i meldinger.',
  'Bestill grønn utkjøring med lokal rute eller hent selv.',
];

export default function MarketplacePage() {
  return (
    <div className="space-y-12 pb-14">
      <header className="space-y-5 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-8">
        <p className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
          Nytt konsept
        </p>
        <h1 className="text-4xl font-semibold">Enkel markedsplass for barneklær</h1>
        <p className="max-w-3xl text-white/85">
          En gratis nettside der folk kan selge og bytte barneklær, med en tydelig og rettferdig
          andel per transaksjon til drift og miljøvennlig utkjøring.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
          <span className="rounded-lg border border-white/20 px-3 py-2">0 kr for annonser</span>
          <span className="rounded-lg border border-white/20 px-3 py-2">12% serviceandel ved salg</span>
          <span className="rounded-lg border border-white/20 px-3 py-2">Grønn levering som standard</span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="card h-full space-y-3 p-6">
            <h2 className="text-xl font-semibold text-emerald-200">{feature.title}</h2>
            <p className="text-sm text-white/80">{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="card space-y-5 p-6">
        <h2 className="text-2xl font-semibold">Slik fungerer det</h2>
        <ol className="space-y-3 text-sm text-white/80">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-200/40 text-xs font-semibold text-emerald-200">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/contact"
            className="rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-200"
          >
            Bli med som pilotfamilie
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:border-emerald-300 hover:text-emerald-200"
          >
            Les mer
          </Link>
        </div>
      </section>
    </div>
  );
}
