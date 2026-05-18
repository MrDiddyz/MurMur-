import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import { ReflectionCard } from '@/components/reflection-card';
import type { Reflection } from '@/lib/types';

export const metadata = {
  title: 'Review — MurMur Learning Lab',
  description: 'Review your recent reflections and insights.',
};

export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
  let reflections: Reflection[] = [];
  let fetchError = false;

  try {
    const db = createServerClient();
    const { data, error } = await db
      .from('reflections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      fetchError = true;
    } else {
      reflections = (data ?? []) as Reflection[];
    }
  } catch {
    fetchError = true;
  }

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-mirror/80">
            Review
          </p>
          <h1 className="text-3xl font-bold text-white">Recent Reflections</h1>
          <p className="text-ink/70">
            Your last {reflections.length > 0 ? reflections.length : '20'} reflections —
            each one a step forward.
          </p>
        </div>
        <Link href="/reflection" className="btn-primary shrink-0">
          + New Reflection
        </Link>
      </header>

      {fetchError && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Could not load reflections. Check your Supabase configuration.
        </p>
      )}

      {!fetchError && reflections.length === 0 && (
        <div className="card py-14 text-center space-y-4">
          <p className="text-4xl">📖</p>
          <p className="text-ink">No reflections yet. Your journey starts here.</p>
          <Link href="/reflection" className="btn-primary inline-block">
            Write a Reflection
          </Link>
        </div>
      )}

      {reflections.length > 0 && (
        <div className="space-y-4">
          {reflections.map((r) => (
            <ReflectionCard key={r.id} reflection={r} />
          ))}
        </div>
      )}
    </div>
  );
}
