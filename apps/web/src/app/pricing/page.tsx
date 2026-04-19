import { getStripeLink, type ModuleKey } from '@/lib/env';

type PricingModule = {
  key: ModuleKey;
  name: string;
  vikingName: string;
  price: string;
  description: string;
  commitment: string;
  features: string[];
};

const modules: PricingModule[] = [
  {
    key: 'foundation',
    name: 'Foundation',
    vikingName: 'Longship Starter',
    price: '9 900 NOK / mnd',
    description: 'For crews that want a stable base for experimentation and reliable weekly delivery.',
    commitment: 'Best for 1-2 core workflows',
    features: ['Onboarding workshop', 'Weekly sync', 'Shared module playbook'],
  },
  {
    key: 'growth',
    name: 'Growth',
    vikingName: 'Raven Fleet',
    price: '24 900 NOK / mnd',
    description:
      'For scaling teams that need stronger analytics, orchestration support and faster implementation cycles.',
    commitment: 'Best for multi-team operations',
    features: ['Everything in Foundation', 'Bi-weekly strategy reviews', 'Custom implementation support'],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    vikingName: 'Valhalla Command',
    price: '49 900 NOK / mnd',
    description: 'For mission-critical environments requiring governance, dedicated architecture and SLA-backed guidance.',
    commitment: 'Best for regulated / high-stakes operations',
    features: ['Everything in Growth', 'Dedicated architect', 'Quarterly roadmap planning'],
  },
];

const battleProvisions = [
  'Policy-gated workflows and execution traces across all tiers',
  'Transparent infrastructure pass-through when relevant',
  'Upgrade path from Foundation to Enterprise with no migration reset',
];

function PaymentPlaceholder({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/60"
      disabled
      aria-label={`${label} coming soon`}
      title="Coming soon"
    >
      {label} (coming soon)
    </button>
  );
}

export default function PricingPage() {
  return (
    <div className="space-y-12 pb-10">
      <header className="space-y-4">
        <p className="inline-flex rounded-full border border-amber-300/30 bg-amber-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
          MurMur Pricing Demo · Viking Edition
        </p>
        <h1 className="text-4xl font-semibold">Choose the ship for your next campaign</h1>
        <p className="max-w-3xl text-white/80">
          We price by operational impact: faster cycle time, stronger governance, and compounding intelligence. Pick a
          tier based on mission depth, then complete checkout with Stripe Payment Links.
        </p>
      </header>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <h2 className="text-lg font-medium text-white">What every crew gets</h2>
        <ul className="mt-3 grid gap-2 text-sm text-white/80 md:grid-cols-3">
          {battleProvisions.map((item) => (
            <li key={item} className="rounded-lg border border-white/10 bg-black/20 p-3">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {modules.map((module) => {
          const stripeLink = getStripeLink(module.key);

          return (
            <article key={module.key} className="card flex h-full flex-col">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">{module.vikingName}</p>
              <h2 className="mt-1 text-2xl font-semibold">{module.name}</h2>
              <p className="mt-2 text-cyan-300">{module.price}</p>
              <p className="mt-1 text-xs text-white/60">{module.commitment}</p>
              <p className="mt-3 text-sm text-white/75">{module.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {module.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {stripeLink ? (
                  <a
                    href={stripeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-black hover:bg-cyan-400"
                  >
                    Set sail with Stripe
                  </a>
                ) : (
                  <button
                    type="button"
                    className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white/60"
                    disabled
                    title="Set the module Stripe env var to enable"
                  >
                    Stripe link not configured
                  </button>
                )}
                <PaymentPlaceholder label="Vipps" />
                <PaymentPlaceholder label="Crypto" />
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
