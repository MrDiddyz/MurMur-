const features = [
  {
    title: 'AI Generation',
    description: 'Generate music loops, album art, and social previews with reusable prompt presets.'
  },
  {
    title: 'Publishing Toolkit',
    description: 'Version works, manage visibility, and launch releases on your own schedule.'
  },
  {
    title: 'Digital Marketplace',
    description: 'Offer licensing tiers and direct downloads with secure file delivery through Supabase.'
  }
];

export function FeatureGrid() {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3">
      {features.map((feature) => (
        <article key={feature.title} className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-xl font-semibold">{feature.title}</h2>
          <p className="mt-3 text-slate-300">{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
