'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/components/vault/shell';
import { fragments, projects } from '@/lib/vault/mock-data';
import type { Fragment } from '@/lib/vault/types';

export default function FragmentsPage() {
  const [draft, setDraft] = useState('');
  const [localFragments, setLocalFragments] = useState<Fragment[]>([]);

  const orderedFragments = useMemo(() => [...localFragments, ...fragments], [localFragments]);

  function handleCapture() {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setLocalFragments((prev) => [
      {
        id: `local-${Date.now()}`,
        title: trimmed.slice(0, 36),
        content: trimmed,
        type: 'Note',
        tags: ['quick-capture'],
        linkedProjectIds: ['murmur-archive-vault'],
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setDraft('');
  }

  return (
    <AppShell title="Idea Fragments" subtitle="Capture quickly and connect fragments to structured projects.">
      <section className="rounded-2xl border border-[#8f7045]/35 bg-[#111] p-3">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Drop a fragment, prompt, note, or half-formed thought..."
          className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-[#191919] px-3 py-3 text-sm text-white placeholder:text-[#7f7f7f]"
        />
        <button
          onClick={handleCapture}
          className="mt-2 w-full rounded-xl bg-[#b89254] px-4 py-3 text-sm font-semibold text-[#261d12] disabled:opacity-40"
          disabled={draft.trim().length === 0}
        >
          Quick Capture
        </button>
      </section>
      <section className="mt-4 space-y-3">
        {orderedFragments.map((fragment) => (
          <article key={fragment.id} className="rounded-2xl border border-white/10 bg-[#121212] p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm text-[#efefef]">{fragment.title}</h3>
              <span className="rounded-full bg-[#b89254]/15 px-2 py-1 text-[11px] text-[#efcf97]">{fragment.type}</span>
            </div>
            <p className="mt-2 text-sm text-[#a5a5a5]">{fragment.content}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fragment.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[#1a1a1a] px-2 py-1 text-[11px] text-[#bdbdbd]">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#8f8f8f]">
              Linked to:{' '}
              {fragment.linkedProjectIds
                .map((projectId) => projects.find((project) => project.id === projectId)?.title ?? projectId)
                .join(' · ')}
            </p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
