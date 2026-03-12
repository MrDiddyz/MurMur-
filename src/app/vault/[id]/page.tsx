import { notFound } from 'next/navigation';
import { AppShell } from '@/components/vault/shell';
import { projects } from '@/lib/vault/mock-data';
import { ProjectDetailTabs } from '@/components/vault/project-detail-tabs';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((entry) => entry.id === id);

  if (!project) {
    notFound();
  }

  return (
    <AppShell title={project.title} subtitle={project.description}>
      <section className="rounded-3xl border border-[#8e7045]/35 bg-[#121212] p-4">
        <p className="text-xs uppercase tracking-wider text-[#b38f58]">{project.type}</p>
        <p className="mt-2 text-sm text-[#a5a5a5]">Updated {project.updatedAt}</p>
        <div className="mt-3 flex gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#1f1f1f] px-2 py-1 text-xs text-[#d5d5d5]">
              #{tag}
            </span>
          ))}
        </div>
      </section>

      <ProjectDetailTabs project={project} />
    </AppShell>
  );
}
