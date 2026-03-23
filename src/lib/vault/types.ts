export type ProjectStatus = 'Active' | 'Incubating' | 'On Hold' | 'Draft';

export type Project = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: ProjectStatus;
  tags: string[];
  maturityScore: number;
  updatedAt: string;
  vision: string;
  problem: string;
  user: string;
  features: string[];
  nextSteps: string[];
};

export type Fragment = {
  id: string;
  title: string;
  content: string;
  type: 'Prompt' | 'Note' | 'System Idea' | 'Flow';
  tags: string[];
  linkedProjectIds: string[];
  createdAt: string;
};

export type AgentType = 'Strategist' | 'Architect' | 'Builder' | 'Curator' | 'Reflector';

export type AgentNote = {
  id: string;
  projectId: string;
  agentType: AgentType;
  title: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
};
