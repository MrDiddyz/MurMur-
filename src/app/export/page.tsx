'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/components/vault/shell';
import { projects } from '@/lib/vault/mock-data';

export default function ExportPage() {
  const [projectId, setProjectId] = useState('murmur-archive-vault');
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId) ?? projects[0],
    [projectId],
  );

  const exportSummary = `# ${selectedProject.title}

## Vision
${selectedProject.vision}

## Problem
${selectedProject.problem}

## User
${selectedProject.user}

## Features
${selectedProject.features.map((feature) => `- ${feature}`).join('\n')}

## Next Steps
${selectedProject.nextSteps.map((step) => `- ${step}`).join('\n')}`;

  return (
    <AppShell title="Export Studio" subtitle="Render polished briefs for startup strategy, product planning, or README handoff.">
      <section className="rounded-3xl border border-[#8e7045]/35 bg-[#111] p-4">
        <label className="text-xs uppercase tracking-wider text-[#bf9d67]">Project</label>
        <select
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#161616] px-3 py-3 text-sm text-white"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>

        <article className="mt-4 rounded-2xl border border-white/10 bg-[#161616] p-4">
          <h3 className="text-sm uppercase tracking-wider text-[#c8a56e]">README Export Preview</h3>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-[#cfcfcf]">{exportSummary}</pre>
        </article>
      </section>
    </AppShell>
  );
}
