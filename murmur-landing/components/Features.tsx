const featureItems = [
  {
    title: "Adaptive Learning Paths",
    description:
      "Personalized modules that meet each employee at their security maturity level.",
  },
  {
    title: "Live Threat Simulations",
    description:
      "Run realistic phishing and social engineering campaigns to test readiness.",
  },
  {
    title: "Actionable Reporting",
    description:
      "Track risk trends, learner progress, and security culture metrics in one dashboard.",
  },
];

export default function Features() {
  return (
    <section className="border-y border-slate-800 bg-slate-900/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-semibold sm:text-4xl">
          Everything You Need to Reduce Human Risk
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featureItems.map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-6"
            >
              <h3 className="text-xl font-semibold text-cyan-200">{feature.title}</h3>
              <p className="mt-3 text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
