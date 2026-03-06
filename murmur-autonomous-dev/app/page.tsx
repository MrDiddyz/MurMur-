import Link from 'next/link';
import { RunForm } from '@/components/RunForm';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Murmur Autonomous Dev</h1>
        <p className="mt-2 text-slate-600">Queue and monitor autonomous software runs.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <RunForm />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <p className="mt-2 text-sm text-slate-600">See active and completed jobs with run statistics.</p>
          <Link className="mt-4 inline-block text-sm font-medium text-blue-600" href="/dashboard">
            Open dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
