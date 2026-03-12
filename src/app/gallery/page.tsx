import type { Metadata } from 'next';

type WorkRow = {
  id: string;
  title: string | null;
  image_url: string | null;
  prompt: string | null;
  price: number | null;
  creator: {
    name: string | null;
  } | null;
};

export const metadata: Metadata = {
  title: 'Gallery | MURMUR',
  description: 'Explore MurMur artworks with creator, prompt, and pricing details.',
};

async function getGalleryWorks(): Promise<{ works: WorkRow[]; error: string | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      works: [],
      error: 'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    };
  }

  const params = new URLSearchParams({
    select: 'id,title,image_url,prompt,price,creator:creator_id(name)',
    order: 'created_at.desc',
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/works?${params.toString()}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return {
      works: [],
      error: `Could not load gallery works (${response.status}).`,
    };
  }

  const data = (await response.json()) as WorkRow[];
  return { works: data ?? [], error: null };
}

function formatPrice(value: number | null): string {
  if (typeof value !== 'number') {
    return 'Not listed';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function GalleryPage() {
  const { works, error } = await getGalleryWorks();

  return (
    <section className="mx-auto w-full max-w-6xl py-10 md:py-14">
      <header className="mb-8 space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">MurMur</p>
        <h1 className="text-3xl font-semibold text-white md:text-4xl">Gallery</h1>
        <p className="max-w-2xl text-sm text-slate-300 md:text-base">
          Discover artworks created in MurMur. Each card shows the creator, prompt used, and listed price.
        </p>
      </header>

      {error ? (
        <p className="rounded-xl border border-amber-300/40 bg-amber-200/10 p-4 text-sm text-amber-100">{error}</p>
      ) : null}

      {!error && works.length === 0 ? (
        <p className="rounded-xl border border-white/15 bg-white/5 p-6 text-slate-200">No artworks found yet.</p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {works.map((work) => (
          <article
            key={work.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-glow backdrop-blur-sm"
          >
            <div className="relative aspect-[4/3] bg-slate-900/80">
              {work.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={work.image_url} alt={work.title ?? 'MurMur artwork'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">No preview</div>
              )}
            </div>
            <div className="space-y-3 p-4">
              <h2 className="text-lg font-medium text-white">{work.title ?? 'Untitled work'}</h2>
              <dl className="space-y-2 text-sm text-slate-300">
                <div>
                  <dt className="text-slate-400">Creator</dt>
                  <dd>{work.creator?.name ?? 'Unknown creator'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Prompt used</dt>
                  <dd className="line-clamp-3">{work.prompt ?? 'No prompt available'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Price</dt>
                  <dd>{formatPrice(work.price)}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
