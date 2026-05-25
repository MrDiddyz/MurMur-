import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="space-y-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mirror/80">
          MurMur Learning Lab
        </p>
        <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
          A Space to Reflect,
          <br />
          <span className="text-mirror">Learn, and Grow</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-ink leading-relaxed">
          Write a reflection. Receive an AI-powered mirror. Build a personal
          constellation of insights and next steps — all saved privately for you.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/reflection" className="btn-primary">
            Start Reflecting
          </Link>
          <Link href="/constellation" className="btn-ghost">
            View My Constellation
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-6">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-ink/60">
          How it works
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.step} className="card space-y-3 text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-mirror/10 text-xl">
                {step.icon}
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-mirror/60">
                Step {step.step}
              </p>
              <h3 className="font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-ink/70 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to begin?</h2>
        <p className="text-ink">
          Your constellation starts with a single reflection.
        </p>
        <Link href="/reflection" className="btn-primary inline-block">
          Write Your First Reflection →
        </Link>
      </section>
    </div>
  );
}

const steps = [
  {
    step: 1,
    icon: '✍️',
    title: 'Write',
    description: 'Share what is on your mind — a challenge, a win, or a question you are sitting with.',
  },
  {
    step: 2,
    icon: '🤖',
    title: 'Receive',
    description: 'AI responds with a mirror, an insight, a next step, and a creative suggestion.',
  },
  {
    step: 3,
    icon: '🌟',
    title: 'Save',
    description: 'Your reflection and a learning node are saved automatically to your constellation.',
  },
  {
    step: 4,
    icon: '🔭',
    title: 'Review',
    description: 'Explore your constellation of nodes and revisit past reflections.',
  },
];
