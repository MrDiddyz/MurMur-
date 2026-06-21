import { StatCard } from '@/components/StatCard';
import { listJobs } from '@/lib/storage';

export default function DashboardPage() {
  const jobs = listJobs();
  const running = jobs.filter((job) => job.status === 'running').length;
  const completed = jobs.filter((job) => job.status === 'completed').length;

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-bold">Job Dashboard</h1>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total jobs" value={jobs.length} />
        <StatCard label="Running" value={running} />
        <StatCard label="Completed" value={completed} />
      </section>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Agent</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-slate-100">
                <td className="p-3">{job.name}</td>
                <td className="p-3">{job.agent}</td>
                <td className="p-3 capitalize">{job.status}</td>
                <td className="p-3">{new Date(job.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
