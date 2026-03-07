export type AgentRole =
  | "teacher"
  | "experimental"
  | "thinktank"
  | "reflective"
  | "evaluator"
  | "evolution";

export type WorkflowStatus = "completed" | "failed";

export type MemoryType =
  | "reflection"
  | "heuristic"
  | "prompt-note"
  | "workflow-note"
  | "quality-signal";

export type EvolutionProposalType =
  | "prompt-change"
  | "routing-change"
  | "tooling-change"
  | "memory-rule"
  | "workflow-change";

export type RiskLevel = "low" | "medium" | "high";

export interface PromptVersion {
  agentRole: AgentRole;
  version: string;
  description: string;
}

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputDescription: string;
  handler: (input: TInput) => Promise<TOutput> | TOutput;
}

export interface ToolCallRecord {
  toolName: string;
  input: unknown;
  output: unknown;
  success: boolean;
  timestamp: string;
  error?: string;
}

export interface AgentTask {
  objective: string;
  input: Record<string, unknown>;
  stepHint?: string;
}

export interface MemoryEntry {
  id: string;
  runId: string;
  workflowId: string;
  type: MemoryType;
  key: string;
  value: unknown;
  createdAt: string;
  sourceAgent: AgentRole;
  relevance: number;
  tags: string[];
}

export interface ReflectionMemory {
  type: MemoryType;
  key: string;
  value: unknown;
  relevance: number;
  tags?: string[];
}

export interface MemoryQuery {
  objective?: string;
  workflowId?: string;
  tags?: string[];
  limit?: number;
}

export interface WorkflowRunStep {
  agentRole: AgentRole;
  stage: string;
  output: unknown;
  startedAt: string;
  completedAt: string;
  summary: string;
  toolCalls: ToolCallRecord[];
}

export interface AgentContext {
  runId: string;
  workflowId: string;
  projectId?: string;
  messages: string[];
  memory: MemoryEntry[];
  availableTools: string[];
  priorSteps: WorkflowRunStep[];
  promptVersions: PromptVersion[];
  metadata: Record<string, unknown>;
  toolCalls: ToolCallRecord[];
}

export interface AgentResult<TOutput = unknown> {
  stage: string;
  output: TOutput;
  summary: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  agentSequence: AgentRole[];
}

export interface WorkflowRunInput {
  workflowId: string;
  runId: string;
  objective: string;
  input: Record<string, unknown>;
  projectId?: string;
}

export interface EvaluationResult {
  stage: "evaluation";
  scores: {
    usefulness: number;
    coherence: number;
    actionability: number;
    originality: number;
    alignment: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
  failureModes: string[];
  recommendations: string[];
}

export interface EvolutionProposal {
  id: string;
  runId: string;
  workflowId: string;
  type: EvolutionProposalType;
  title: string;
  rationale: string;
  expectedBenefit: string;
  riskLevel: RiskLevel;
  patchHint?: string;
  applyMode: "manual-review";
  createdAt: string;
}

export interface WorkflowRunResult {
  runId: string;
  workflowId: string;
  status: WorkflowStatus;
  steps: WorkflowRunStep[];
  finalOutput: unknown;
  evaluation?: EvaluationResult;
  memoryWrites?: MemoryEntry[];
  evolution?: EvolutionProposal[];
  routingDecisions: Array<{ reason: string; action: string }>;
  promptVersions: PromptVersion[];
  toolCalls: ToolCallRecord[];
  error?: string;
}
