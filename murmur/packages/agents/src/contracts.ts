export type AgentStatus = "success" | "partial" | "failed";

export type AgentPlan = "free" | "pro" | "label";

export type AgentConstraints = {
  language?: string;
  genre?: string;
  tone?: string;
  plan?: AgentPlan;
  maxTokens?: number;
};

export type MemoryWrite = {
  key: string;
  value: unknown;
  scope?: "run" | "user" | "project";
  ttlSeconds?: number;
};

export type ArtifactDraft = {
  kind: string;
  title: string;
  content: unknown;
  metadata?: Record<string, unknown>;
};

export type AgentInput<TContext = unknown, TTask = unknown> = {
  runId: string;
  userId: string;
  projectId?: string;
  context: TContext;
  task: TTask;
  constraints?: AgentConstraints;
};

export type AgentOutput<TResult = unknown> = {
  status: AgentStatus;
  result: TResult;
  summary: string;
  score?: number;
  warnings?: string[];
  nextActions?: string[];
  memoryWrites?: MemoryWrite[];
  artifacts?: ArtifactDraft[];
};

export interface AgentContract<
  TContext = unknown,
  TTask = unknown,
  TResult = unknown,
> {
  key: string;
  version: string;
  description: string;
  run(input: AgentInput<TContext, TTask>): Promise<AgentOutput<TResult>>;
}

const AGENT_STATUSES: readonly AgentStatus[] = ["success", "partial", "failed"];
const AGENT_PLANS: readonly AgentPlan[] = ["free", "pro", "label"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isAgentInput<TContext = unknown, TTask = unknown>(
  value: unknown,
): value is AgentInput<TContext, TTask> {
  if (!isRecord(value)) return false;
  if (typeof value.runId !== "string" || typeof value.userId !== "string") {
    return false;
  }

  if ("projectId" in value && value.projectId !== undefined && typeof value.projectId !== "string") {
    return false;
  }

  if ("constraints" in value && value.constraints !== undefined) {
    if (!isRecord(value.constraints)) return false;

    const { language, genre, tone, plan, maxTokens } = value.constraints;
    if (language !== undefined && typeof language !== "string") return false;
    if (genre !== undefined && typeof genre !== "string") return false;
    if (tone !== undefined && typeof tone !== "string") return false;
    if (plan !== undefined && !AGENT_PLANS.includes(plan as AgentPlan)) return false;
    if (maxTokens !== undefined && typeof maxTokens !== "number") return false;
  }

  return "context" in value && "task" in value;
}

export function isAgentOutput<TResult = unknown>(
  value: unknown,
): value is AgentOutput<TResult> {
  if (!isRecord(value)) return false;
  if (!AGENT_STATUSES.includes(value.status as AgentStatus)) return false;
  if (typeof value.summary !== "string") return false;
  if (!("result" in value)) return false;

  if ("score" in value && value.score !== undefined && typeof value.score !== "number") {
    return false;
  }

  if (
    "warnings" in value &&
    value.warnings !== undefined &&
    (!Array.isArray(value.warnings) || value.warnings.some((item) => typeof item !== "string"))
  ) {
    return false;
  }

  if (
    "nextActions" in value &&
    value.nextActions !== undefined &&
    (!Array.isArray(value.nextActions) || value.nextActions.some((item) => typeof item !== "string"))
  ) {
    return false;
  }

  return true;
}
