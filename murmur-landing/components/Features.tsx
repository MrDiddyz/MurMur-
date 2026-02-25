const features = [
  {
    title: 'Signal-first Detection',
    description:
      'Correlate logs, endpoint events, and cloud telemetry into a single timeline so analysts can triage confidently.',
  },
  {
    title: 'Automated Response Flows',
    description:
      'Trigger playbooks from high-confidence detections to isolate hosts, revoke tokens, or notify your stakeholders instantly.',
  },
  {
    title: 'Executive-ready Reporting',
    description:
      'Transform investigation data into clear reports that communicate risk, impact, and remediation progress.',
  },
];

export default function Features() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Why teams choose MurMur</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
