const plans = [
  {
    name: "Starter",
    price: "$12",
    description: "Great for growing teams beginning their awareness journey.",
    features: ["Up to 50 users", "Monthly simulations", "Email support"],
  },
  {
    name: "Growth",
    price: "$29",
    description: "Best for organizations scaling security training.",
    features: ["Up to 500 users", "Weekly simulations", "Manager analytics"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Advanced security programs with full customization.",
    features: ["Unlimited users", "Custom scenarios", "Dedicated success lead"],
  },
];

export default function Pricing() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-semibold sm:text-4xl">Pricing</h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-xl border p-6 ${
              plan.featured
                ? "border-cyan-400 bg-cyan-500/10"
                : "border-slate-800 bg-slate-900/50"
            }`}
          >
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="mt-3 text-3xl font-bold">{plan.price}</p>
            <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-200">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
