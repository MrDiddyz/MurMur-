import type { Fragment, Project } from '@/lib/vault/types';

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-[#9f7e4c]/30 bg-[#101010] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.15em] text-[#b0905f]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#f7f1e7]">{value}</p>
    </article>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-3xl border border-[#8a6f42]/35 bg-[#121212] p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-medium text-[#f5f5f5]">{project.title}</h3>
        <span className="rounded-full border border-[#9d7b45]/40 px-2 py-1 text-xs text-[#f0cc8d]">{project.status}</span>
      </div>
      <p className="mt-2 text-sm text-[#a5a5a5]">{project.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-[#1a1a1a] px-2 py-1 text-xs text-[#b8b8b8]">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export function FragmentCard({ fragment }: { fragment: Fragment }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#121212] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-[#efefef]">{fragment.title}</h3>
        <span className="rounded-full bg-[#b89254]/15 px-2 py-1 text-[11px] text-[#edcc95]">{fragment.type}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#a5a5a5]">{fragment.content}</p>
    </article>
  );
}
