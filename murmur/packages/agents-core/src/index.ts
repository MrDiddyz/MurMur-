export type JsonObject = Record<string, unknown>;

export type AgentId = "teacher" | "experimental" | "thinktank" | "reflective";

export interface WorkflowRunStep {
  agentId: AgentId;
  stage: WorkflowStage;
  output: unknown;
  startedAt: string;
  completedAt: string;
}

export interface WorkflowRunResult {
  runId: string;
  workflowId: string;
  status: "completed";
  steps: WorkflowRunStep[];
  finalOutput: unknown;
}

export type WorkflowStage =
  | TeacherOutput["stage"]
  | ExperimentalOutput["stage"]
  | ThinktankOutput["stage"]
  | ReflectiveOutput["stage"];

export interface WorkflowRunPayload {
  workflowId: string;
  runId: string;
  goal: string;
  input: JsonObject;
}

export interface WorkflowContext {
  workflowId: string;
  runId: string;
  goal: string;
  input: JsonObject;
  history: WorkflowRunStep[];
}

export interface Variant {
  id: string;
  title: string;
  angle: string;
}

export interface TeacherOutput {
  stage: "planning";
  objective: string;
  constraints: string[];
  plan: string[];
  successCriteria: string[];
}

export interface ExperimentalOutput {
  stage: "exploration";
  variants: Variant[];
  recommendation: string;
}

export interface ThinktankPanelOpinion {
  persona: string;
  opinion: string;
}

export interface ThinktankOutput {
  stage: "synthesis";
  selectedVariant: Variant;
  panel: ThinktankPanelOpinion[];
  consensus: string;
}

export interface ReflectiveOutput {
  stage: "reflection";
  finalDraft: {
    direction: Variant;
    rationale: string;
    improvements: string[];
  };
  shouldPersistMemory: boolean;
}

export interface Agent<I, O> {
  readonly id: AgentId;
  execute(input: I, context: WorkflowContext): Promise<O>;
}

export class AgentRegistry {
  private readonly agents = new Map<AgentId, Agent<unknown, unknown>>();

  register<I, O>(agent: Agent<I, O>): this {
    this.agents.set(agent.id, agent as Agent<unknown, unknown>);
    return this;
  }

  get<I, O>(id: AgentId): Agent<I, O> {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new Error(`Agent not registered: ${id}`);
    }
    return agent as Agent<I, O>;
  }
}
