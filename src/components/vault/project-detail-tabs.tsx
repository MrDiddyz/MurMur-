'use client';

import { useMemo, useState } from 'react';
import { agentNotes, fragments } from '@/lib/vault/mock-data';
import type { Project } from '@/lib/vault/types';

const tabs = ['Overview', 'Fragments', 'Structure', 'Agent Notes', 'Export'] as const;

export function ProjectDetailTabs({ project }: { project: Project }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Overview');
  const linkedFragments = useMemo(() => fragments.filter((fragment) => fragment.linkedProjectIds.includes(project.id)), [project.id]);
  const linkedNotes = useMemo(() => agentNotes.filter((note) => note.projectId === project.id), [project.id]);

  return (
    <>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            className={`whitespace-nowrap rounded-full px-3 py-2 text-xs ${
              tab === tabName ? 'bg-[#b89254] text-[#1c1408]' : 'border border-white/15 bg-[#111] text-[#c5c5c5]'
            }`}
          >
            {tabName}
          </button>
        ))}
      </div>

      {(tab === 'Overview' || tab === 'Structure') && (
        <section className="mt-4 space-y-3">
          {[['Vision', project.vision], ['Problem', project.problem], ['User', project.user]].map(([title, content]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-[#121212] p-4">
              <h3 className="text-sm uppercase tracking-[0.16em] text-[#c7a56d]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a8a8a8]">{content}</p>
            </article>
          ))}
          <article className="rounded-2xl border border-white/10 bg-[#121212] p-4">
            <h3 className="text-sm uppercase tracking-[0.16em] text-[#c7a56d]">Features</h3>
            <ul className="mt-2 space-y-2 text-sm text-[#a8a8a8]">
              {project.features.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[#121212] p-4">
            <h3 className="text-sm uppercase tracking-[0.16em] text-[#c7a56d]">Next Steps</h3>
            <ul className="mt-2 space-y-2 text-sm text-[#a8a8a8]">
              {project.nextSteps.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {tab === 'Fragments' && (
        <section className="mt-4 space-y-3">
          {linkedFragments.map((fragment) => (
            <article key={fragment.id} className="rounded-2xl border border-white/10 bg-[#121212] p-4">
              <h3 className="text-sm text-[#f2f2f2]">{fragment.title}</h3>
              <p className="mt-2 text-sm text-[#a8a8a8]">{fragment.content}</p>
            </article>
          ))}
        </section>
      )}

      {tab === 'Agent Notes' && (
        <section className="mt-4 space-y-3">
          {linkedNotes.map((note) => (
            <article key={note.id} className="rounded-2xl border border-[#8e7045]/35 bg-[#121212] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm text-[#f3f3f3]">{note.title}</h3>
                <span className="text-xs text-[#e3bf84]">{note.agentType}</span>
              </div>
              <p className="mt-2 text-sm text-[#a7a7a7]">{note.content}</p>
            </article>
          ))}
        </section>
      )}

      {tab === 'Export' && (
        <section className="mt-4 rounded-2xl border border-[#8e7045]/35 bg-[#111] p-4">
          <h3 className="text-sm uppercase tracking-[0.16em] text-[#c7a56d]">README Style Brief</h3>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-[#c7c7c7]">
{`# ${project.title}

## Vision
${project.vision}

## Problem
${project.problem}

## User
${project.user}

## Features
${project.features.map((item) => `- ${item}`).join('\n')}

## Next Steps
${project.nextSteps.map((item) => `- ${item}`).join('\n')}`}
          </pre>
        </section>
      )}
    </>
  );
}
