'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/vault/shell';
import { filterProjects } from '@/lib/vault/selectors';
import type { ProjectStatus } from '@/lib/vault/types';

const chips: Array<'All' | ProjectStatus> = ['All', 'Active', 'Incubating', 'On Hold', 'Draft'];

export default function VaultPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof chips)[number]>('All');

  const filteredProjects = useMemo(() => filterProjects(query, status), [query, status]);

  return (
    <AppShell title="Project Vault" subtitle="Browse, filter, and open projects from your archive ecosystem.">
      <div className="rounded-2xl border border-[#8e7045]/30 bg-[#111] p-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects, tags, or concepts..."
          className="w-full rounded-xl border border-white/10 bg-[#161616] px-3 py-3 text-sm text-white placeholder:text-[#7e7e7e] focus:outline-none focus:ring-1 focus:ring-[#b89254]"
        />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => setStatus(chip)}
            className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs ${
              status === chip
                ? 'border-[#c9a367] bg-[#b89254]/20 text-[#f7d79f]'
                : 'border-[#8e7045]/40 bg-[#121212] text-[#d8ba86]'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {filteredProjects.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-[#101010] p-4 text-sm text-[#9f9f9f]">No projects match your search.</p>
        )}
        {filteredProjects.map((project) => (
          <Link
            key={project.id}
            href={`/vault/${project.id}`}
            className="block rounded-3xl border border-[#8e7045]/30 bg-[#111] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base text-[#f4f4f4]">{project.title}</h3>
                <p className="mt-1 text-sm text-[#9d9d9d]">{project.type}</p>
              </div>
              <span className="rounded-full border border-[#8e7045]/40 px-2 py-1 text-xs text-[#e7c78d]">{project.status}</span>
            </div>
            <p className="mt-3 text-sm text-[#aaaaaa]">{project.description}</p>
            <p className="mt-3 text-xs uppercase tracking-wider text-[#8f8f8f]">Maturity {project.maturityScore}%</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
