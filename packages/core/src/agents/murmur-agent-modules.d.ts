declare module "@murmur/contracts/agent/base" {
  export type AgentOutput<T> = {
    status: "success" | "partial" | "failed";
    summary: string;
    result: T;
  };
}

declare module "@murmur/contracts/agent/experimental" {
  export type ExperimentalOption = { title: string };

  export type ExperimentalResult = {
    options: ExperimentalOption[];
    [key: string]: unknown;
  };
}

declare module "@murmur/contracts/agent/reflective" {
  export type ReflectiveTask = {
    sourceRunId: string;
    acceptedArtifacts: string[];
    rejectedArtifacts: string[];
    userFeedback: string;
  };
}

declare module "@murmur/contracts/agent/think-tank" {
  export type ThinkTankTask = {
    evaluateTarget: "artifact";
    criteria: string[];
    candidate: unknown;
  };
}

declare module "@murmur/contracts/workflow/base" {
  export type WorkflowStep = {
    key: string;
    handler: string;
  };

  export type WorkflowDefinition = {
    key: string;
    steps: WorkflowStep[];
  };
}

declare module "@murmur/contracts/workflow/song-ideation" {
  import type { WorkflowDefinition } from "@murmur/contracts/workflow/base";

  export const songIdeationWorkflow: WorkflowDefinition;
}

declare module "@murmur/experimental-agent" {
  import type { AgentOutput } from "@murmur/contracts/agent/base";
  import type { ExperimentalResult } from "@murmur/contracts/agent/experimental";

  export const experimentalAgent: {
    run(input: {
      runId: string;
      userId: string;
      projectId: string;
      context: Record<string, unknown>;
      task: {
        target: string;
        brief: string;
        variationCount: number;
        riskLevel: string;
      };
      constraints: {
        language: string;
        genre: string;
        tone: string;
        plan: string;
        maxTokens: number;
      };
    }): Promise<AgentOutput<ExperimentalResult>>;
  };
}

declare module "@murmur/think-tank-agent" {
  import type { AgentOutput } from "@murmur/contracts/agent/base";
  import type { ThinkTankTask } from "@murmur/contracts/agent/think-tank";

  export const thinkTankAgent: {
    run(input: {
      runId: string;
      userId: string;
      projectId: string;
      context: Record<string, unknown>;
      task: ThinkTankTask;
      constraints: {
        language: string;
        genre: string;
        tone: string;
        plan: string;
        maxTokens: number;
      };
    }): Promise<AgentOutput<unknown>>;
  };
}

declare module "@murmur/reflective-agent" {
  import type { AgentOutput } from "@murmur/contracts/agent/base";
  import type { ReflectiveTask } from "@murmur/contracts/agent/reflective";

  export const reflectiveAgent: {
    run(input: {
      runId: string;
      userId: string;
      projectId: string;
      context: Record<string, unknown>;
      task: ReflectiveTask;
      constraints: {
        language: string;
        genre: string;
        tone: string;
        plan: string;
        maxTokens: number;
      };
    }): Promise<AgentOutput<unknown>>;
  };
}
