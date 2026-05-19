import Link from 'next/link';
import { getReviewSnapshot } from '@/lib/server/learning-lab';

type ReviewPageProps = {
  searchParams?: { reflectionId?: string };
};

export const dynamic = 'force-dynamic';

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const snapshot = await getReviewSnapshot(searchParams?.reflectionId);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-12">
      <header className="card space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Review</p>
        <h1 className="text-3xl font-semibold text-white">AI reflection response</h1>
      </header>

      {!snapshot ? (
        <section className="card space-y-3">
          <p className="text-ink">No reflection found yet.</p>
          <Link href="/reflection" className="text-sm text-cyan-200 hover:text-cyan-100">
            Write a reflection
          </Link>
        </section>
      ) : (
        <>
          <section className="card space-y-3">
            <h2 className="text-xl font-semibold text-white">Your reflection</h2>
            <p className="whitespace-pre-wrap text-ink">{snapshot.reflection.content}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="card space-y-2">
              <h3 className="font-semibold text-cyan-100">Mirror</h3>
              <p className="text-ink">{snapshot.reflection.mirror}</p>
            </article>
            <article className="card space-y-2">
              <h3 className="font-semibold text-cyan-100">Insight</h3>
              <p className="text-ink">{snapshot.reflection.insight}</p>
            </article>
            <article className="card space-y-2">
              <h3 className="font-semibold text-cyan-100">Next step</h3>
              <p className="text-ink">{snapshot.reflection.next_step}</p>
            </article>
            <article className="card space-y-2">
              <h3 className="font-semibold text-cyan-100">Creative suggestion</h3>
              <p className="text-ink">{snapshot.reflection.creative_suggestion}</p>
            </article>
          </section>

          {snapshot.node ? (
            <section className="card space-y-2">
              <h2 className="text-xl font-semibold text-white">Learning node created</h2>
              <p className="text-cyan-100">{snapshot.node.title}</p>
              <p className="text-ink">{snapshot.node.summary}</p>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
