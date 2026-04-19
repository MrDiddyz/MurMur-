import { notFound } from 'next/navigation';

import { creatorProfiles, getCreatorProfileByUsername } from '@/lib/creator/mock-data';

type CreatorPageProps = {
  params: {
    username: string;
  };
};

export function generateStaticParams() {
  return creatorProfiles.map((profile) => ({ username: profile.username }));
}

export default function CreatorProfilePage({ params }: CreatorPageProps) {
  const profile = getCreatorProfileByUsername(params.username);

  if (!profile) {
    notFound();
  }

  return (
    <main className="-mx-6 -mt-6 min-h-screen bg-[#0b1020] px-6 pb-16 text-[#f5f7ff] md:-mx-10 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8 py-14">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9eb4ff]">Creator Profile</p>
          <h1 className="text-4xl font-semibold">{profile.name}</h1>
          <p className="text-[#c7d3ff]">@{profile.username}</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Prompts</h2>
          <div className="grid gap-4">
            {profile.prompts.map((prompt) => (
              <article key={prompt.id} className="rounded-xl border border-white/15 bg-white/5 p-5">
                <h3 className="text-lg font-medium">{prompt.title}</h3>
                <p className="mt-2 text-sm text-[#ced7ff]">{prompt.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Prompt Packs</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {profile.promptPacks.map((pack) => (
              <article key={pack.id} className="rounded-xl border border-[#8da2ff]/30 bg-[#121938] p-5">
                <h3 className="text-lg font-medium">{pack.name}</h3>
                <p className="mt-2 text-sm text-[#ced7ff]">{pack.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.15em] text-[#9eb4ff]">{pack.promptCount} prompts</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
