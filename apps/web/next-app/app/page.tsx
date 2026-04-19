import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: '€49 / mnd',
    description: 'For små team som trenger trygg AI-automatisering og rapportering.',
  },
  {
    name: 'Growth',
    price: '€149 / mnd',
    description: 'For selskaper som trenger integrasjoner, prioritet og avansert innsikt.',
  },
  {
    name: 'Vipps Startpakke',
    price: 'NOK 1490 (engang)',
    description: 'Lav terskel onboarding med oppsett, kvalitetssikring og første sprint.',
  },
];

const murmurWorldLocations = [
  'Aurora Gallery',
  'Nova Gallery',
  'Echo Gallery',
  'Marketplace Plaza',
  'AI Museum',
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-14">
      <header className="space-y-6 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">MurMur SaaS</p>
        <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">Automatiser kundeoppfølging med trygg AI</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          MurMur kombinerer markedsføringsside, Stripe-abonnement, Vipps Startpakke og et beskyttet dashboard med
          abonnementskontroll.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white" href="/dashboard">
            Gå til dashboard
          </Link>
          <Link className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-900" href="/en">
            English version
          </Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{plan.name}</h2>
            <p className="mt-2 text-lg font-medium text-slate-700">{plan.price}</p>
            <p className="mt-3 text-sm text-slate-600">{plan.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
