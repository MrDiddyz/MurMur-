import { notFound } from 'next/navigation';
import { creatorProfilesByUsername } from '@/data/creators';

type CreatorProfilePageProps = {
  params: {
    username: string;
  };
};

export default function CreatorProfilePage({ params }: CreatorProfilePageProps) {
  const profile = creatorProfilesByUsername[params.username];

  if (!profile) {
    notFound();
  }

  return (
    <div className="-mx-6 -mt-6 min-h-screen bg-[#f8f5ef] px-6 pb-16 text-[#1f1f1f] md:-mx-10 md:px-10">
      <main className="mx-auto max-w-4xl space-y-8 py-14">
        <header className="rounded-2xl border border-[#d9cdbd] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a6444]">Creator Profile</p>
          <h1 className="mt-2 text-4xl font-semibold">{profile.name}</h1>
          <p className="mt-1 text-base text-[#5f5244]">@{profile.username}</p>
          <p className="mt-4 text-base leading-relaxed text-[#3f3428]">{profile.bio}</p>
        </header>

        <section className="rounded-2xl border border-[#d9cdbd] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Prompts</h2>
          <ul className="mt-4 space-y-4">
            {profile.prompts.map((prompt) => (
              <li key={prompt.id} className="rounded-xl border border-[#eadfce] bg-[#fdfbf7] p-4">
                <p className="text-lg font-medium text-[#2d241b]">{prompt.title}</p>
                <p className="mt-1 text-sm text-[#5f5244]">{prompt.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#d9cdbd] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Prompt Packs</h2>
          <ul className="mt-4 space-y-4">
            {profile.promptPacks.map((pack) => (
              <li key={pack.id} className="rounded-xl border border-[#eadfce] bg-[#fdfbf7] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-lg font-medium text-[#2d241b]">{pack.title}</p>
                  <span className="rounded-full border border-[#d9cdbd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#6f5842]">
                    {pack.promptCount} prompts
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#5f5244]">{pack.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
