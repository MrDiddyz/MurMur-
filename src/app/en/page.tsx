import Link from 'next/link';

export default function EnglishLandingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-14">
      <header className="space-y-5 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">MurMur SaaS</p>
        <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">Subscription-first AI operations for SMBs</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Production-ready Next.js stack with Stripe subscriptions, Vipps onboarding package, Supabase-backed access
          control, and observability endpoints.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white" href="/dashboard">
            Open dashboard
          </Link>
          <Link className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-900" href="/">
            Norsk versjon
          </Link>
        </div>
      </header>
    </div>
  );
}
