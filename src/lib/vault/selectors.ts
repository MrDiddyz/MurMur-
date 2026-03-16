import { agentNotes, fragments, projects } from '@/lib/vault/mock-data';
import type { Project, ProjectStatus } from '@/lib/vault/types';

export function getDashboardStats() {
  const activeProjects = projects.filter((project) => project.status === 'Active').length;
  const avgMaturity = Math.round(projects.reduce((sum, project) => sum + project.maturityScore, 0) / projects.length);
  const highPriorityNotes = agentNotes.filter((note) => note.priority === 'High').length;

  return {
    activeProjects,
    totalFragments: fragments.length,
    avgMaturity,
    nextActions: highPriorityNotes + activeProjects,
  };
}

export function filterProjects(query: string, status: 'All' | ProjectStatus): Project[] {
  const normalizedQuery = query.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesStatus = status === 'All' || project.status === status;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      project.title.toLowerCase().includes(normalizedQuery) ||
      project.description.toLowerCase().includes(normalizedQuery) ||
      project.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    return matchesStatus && matchesQuery;
  });
}

export function getSuggestedActions() {
  return [
    'Structure 3 recent fragments into one active project',
    'Review high-priority Strategist and Builder notes',
    'Export one README-style brief before end of day',
  ];
}
