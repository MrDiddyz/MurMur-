const tiers = [
  {
    name: 'Starter',
    price: '$49',
    description: 'Best for small security teams getting started.',
    highlights: ['1,000 monitored assets', '5 automated playbooks', 'Email support'],
  },
  {
    name: 'Growth',
    price: '$129',
    description: 'For scaling teams that need deeper automation.',
    highlights: ['10,000 monitored assets', 'Unlimited playbooks', 'Slack + PagerDuty integrations'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Advanced controls and support for global operations.',
    highlights: ['Dedicated success manager', 'SSO + SCIM', 'Priority incident response'],
  },
];

export default function Pricing() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Simple pricing, clear value</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-900">{tier.name}</h3>
              <p className="mt-3 text-3xl font-bold text-slate-900">{tier.price}</p>
              <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                {tier.highlights.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
