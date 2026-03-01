import Link from 'next/link';
import { getStripeLink, type ModuleKey } from '@/lib/env';

type PricingModule = {
  key: ModuleKey;
  name: string;
  price: string;
  description: string;
  features: string[];
};

const modules: PricingModule[] = [
  {
    key: 'foundation',
    name: 'Foundation',
    price: '9 900 NOK / mnd',
    description: 'For teams that want a stable base for experimentation and structured execution.',
    features: ['Onboarding workshop', 'Weekly sync', 'Shared module playbook'],
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '24 900 NOK / mnd',
    description: 'For teams scaling operations with analytics, automation support and prioritized backlog work.',
    features: ['Everything in Foundation', 'Bi-weekly strategy reviews', 'Custom implementation support'],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '49 900 NOK / mnd',
    description: 'For organizations needing dedicated support, governance and deeply integrated workflows.',
    features: ['Everything in Growth', 'Dedicated architect', 'Quarterly roadmap planning'],
  },
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
    <div className="space-y-10 pb-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold">Pricing</h1>
        <p className="text-white/80">Choose a module and complete checkout with Stripe Payment Links.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {modules.map((module) => {
          const stripeLink = getStripeLink(module.key);

          return (
            <article key={module.key} className="card flex h-full flex-col">
              <h2 className="text-2xl font-semibold">{module.name}</h2>
              <p className="mt-2 text-cyan-300">{module.price}</p>
              <p className="mt-3 text-sm text-white/75">{module.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {module.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {stripeLink ? (
                  <Link
                    href={stripeLink}
                    className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-black hover:bg-cyan-400"
                  >
                    Pay with Stripe
                  </Link>
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
