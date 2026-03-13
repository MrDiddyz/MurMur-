import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardAccess } from '@/lib/server/billing';

export default async function DashboardPage() {
  const access = await getDashboardAccess();

  if (!access.allowed) {
    redirect('/?access=inactive');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-14">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Customer dashboard</h1>
        <p className="mt-2 text-slate-600">Subscription status: {access.subscription.status}</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-medium text-slate-900">Billing</h2>
        <p className="mt-2 text-sm text-slate-600">
          Plan: <span className="font-medium">{access.subscription.plan_code}</span>
        </p>
        <p className="text-sm text-slate-600">
          Current period end:{' '}
          <span className="font-medium">{access.subscription.current_period_end ?? 'No expiration date'}</span>
        </p>

        <form action="/api/billing/portal" method="post" className="mt-4">
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="submit">
            Open Stripe customer portal
          </button>
        </form>
      </section>

      <Link href="/" className="text-sm font-medium text-sky-700 underline">
        Back to marketing page
      </Link>
    </div>
  );
}
