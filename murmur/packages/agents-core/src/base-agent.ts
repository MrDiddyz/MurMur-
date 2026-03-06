export type AgentRole =
  | "teacher"
  | "experimental"
  | "thinktank"
  | "reflective";

export type AgentMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AgentTask = {
  id: string;
  type: string;
  goal: string;
  input: Record<string, unknown>;
};

export type AgentContext = {
  runId: string;
  workflowId: string;
  projectId?: string;
  messages: AgentMessage[];
  memory?: Record<string, unknown>;
  tools?: string[];
};

export type AgentResult = {
  summary: string;
  output: Record<string, unknown>;
  nextStep?: string;
  score?: number;
};

export interface BaseAgent {
  readonly name: string;
  readonly role: AgentRole;

  run(task: AgentTask, context: AgentContext): Promise<AgentResult>;
}

export function createTextSummary(
  agentName: string,
  goal: string,
  details: Record<string, unknown>,
): string {
  const detailText = Object.entries(details)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join(", ");

  return `[${agentName}] handled goal "${goal}"${detailText ? ` | ${detailText}` : ""}`;
}
