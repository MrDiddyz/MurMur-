import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import { NodeCard } from '@/components/node-card';
import type { LearningNode } from '@/lib/types';

export const metadata = {
  title: 'Constellation — MurMur Learning Lab',
  description: 'Explore your personal constellation of learning nodes.',
};

export const dynamic = 'force-dynamic';

export default async function ConstellationPage() {
  let nodes: LearningNode[] = [];
  let fetchError = false;

  try {
    const db = createServerClient();
    const { data, error } = await db
      .from('learning_nodes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      fetchError = true;
    } else {
      nodes = (data ?? []) as LearningNode[];
    }
  } catch {
    fetchError = true;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-mirror/80">
          Constellation
        </p>
        <h1 className="text-3xl font-bold text-white">Your Learning Nodes</h1>
        <p className="text-ink/70">
          Each reflection creates a node — a crystallised insight in your
          personal knowledge constellation.
        </p>
      </header>

      {fetchError && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Could not load nodes. Check your Supabase configuration.
        </p>
      )}

      {!fetchError && nodes.length === 0 && (
        <div className="card py-14 text-center space-y-4">
          <p className="text-4xl">🌌</p>
          <p className="text-ink">Your constellation is empty — start with your first reflection.</p>
          <Link href="/reflection" className="btn-primary inline-block">
            Write a Reflection
          </Link>
        </div>
      )}

      {nodes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
