export type Vault = {
  id: string;
  name: string;
  description: string;
  projectCount: number;
  updatedAt: string;
};

export type Project = {
  id: string;
  vaultId: string;
  title: string;
  status: 'Draft' | 'In Review' | 'Approved';
  summary: string;
  tags: string[];
  updatedAt: string;
};

export type Fragment = {
  id: string;
  projectId: string;
  title: string;
  type: 'Insight' | 'Task' | 'Reference';
  body: string;
};

export type AgentNote = {
  id: string;
  projectId: string;
  agent: string;
  note: string;
  createdAt: string;
};

export const mockVaults: Vault[] = [
  {
    id: 'vault_ops',
    name: 'Operator Vault',
    description: 'Execution plans, decision logs, and sprint artifacts.',
    projectCount: 2,
    updatedAt: '2h ago',
  },
  {
    id: 'vault_research',
    name: 'Research Vault',
    description: 'Discovery notes, prompt studies, and intelligence snapshots.',
    projectCount: 1,
    updatedAt: 'Yesterday',
  },
  {
    id: 'vault_archive',
    name: 'Archive Vault',
    description: 'Older projects retained for historical context and retrieval.',
    projectCount: 0,
    updatedAt: '3w ago',
  },
];

export const mockProjects: Project[] = [
  {
    id: 'proj_signal_map',
    vaultId: 'vault_ops',
    title: 'Signal Mapping Sprint',
    status: 'In Review',
    summary: 'Map fragmented field signals into a unified execution board.',
    tags: ['strategy', 'mapping', 'sprint'],
    updatedAt: '15m ago',
  },
  {
    id: 'proj_story_threads',
    vaultId: 'vault_ops',
    title: 'Story Threads',
    status: 'Draft',
    summary: 'Build narrative-ready threads from production fragments.',
    tags: ['content', 'threads'],
    updatedAt: '4h ago',
  },
  {
    id: 'proj_field_notes',
    vaultId: 'vault_research',
    title: 'Field Notes Pack',
    status: 'Approved',
    summary: 'Curated qualitative notes for Q2 experimentation.',
    tags: ['research', 'qualitative'],
    updatedAt: '2d ago',
  },
];

export const mockFragments: Fragment[] = [
  {
    id: 'frag_1',
    projectId: 'proj_signal_map',
    title: 'North star metric mismatch',
    type: 'Insight',
    body: 'Operators optimize short-cycle wins while stakeholders track retention movement.',
  },
  {
    id: 'frag_2',
    projectId: 'proj_signal_map',
    title: 'Interview synthesis',
    type: 'Reference',
    body: 'Three team leads reported context switching during handoffs.',
  },
  {
    id: 'frag_3',
    projectId: 'proj_story_threads',
    title: 'Publish first thread',
    type: 'Task',
    body: 'Draft 5 post thread that translates sprint outcomes into public narrative.',
  },
];

export const mockAgentNotes: AgentNote[] = [
  {
    id: 'note_1',
    projectId: 'proj_signal_map',
    agent: 'Synth Agent',
    note: 'Consider splitting the board into intake and execution lanes.',
    createdAt: 'Today · 08:21',
  },
  {
    id: 'note_2',
    projectId: 'proj_signal_map',
    agent: 'Risk Agent',
    note: 'Missing owner labels on two high-impact tasks.',
    createdAt: 'Today · 09:47',
  },
  {
    id: 'note_3',
    projectId: 'proj_story_threads',
    agent: 'Narrative Agent',
    note: 'Lead with concrete operator outcome before framing theory.',
    createdAt: 'Yesterday · 17:12',
  },
];

export function getProjectById(projectId: string): Project | undefined {
  return mockProjects.find((project) => project.id === projectId);
}

export function getVaultProjects(vaultId: string): Project[] {
  return mockProjects.filter((project) => project.vaultId === vaultId);
}

export function getProjectFragments(projectId: string): Fragment[] {
  return mockFragments.filter((fragment) => fragment.projectId === projectId);
}

export function getProjectAgentNotes(projectId: string): AgentNote[] {
  return mockAgentNotes.filter((note) => note.projectId === projectId);
}
