import { reflectiveAgent } from "@murmur/reflective-agent";
import { thinkTankAgent } from "@murmur/think-tank-agent";
import type { AgentOutput } from "@murmur/contracts/agent/base";
import type { ReflectiveTask } from "@murmur/contracts/agent/reflective";
import type { ThinkTankTask } from "@murmur/contracts/agent/think-tank";
import type { WorkflowDefinition } from "@murmur/contracts/workflow/base";
import { songIdeationWorkflow } from "@murmur/contracts/workflow/song-ideation";
import type { ExperimentalResult } from "@murmur/contracts/agent/experimental";
import { experimentalAgent } from "@murmur/experimental-agent";

export type RunWorkflowInput = {
  workflow?: WorkflowDefinition;
  runId: string;
  userId: string;
  projectId: string;
  brief: string;
  language?: string;
  genre?: string;
  tone?: string;
};

export type RunWorkflowResult = {
  workflowKey: string;
  status: "success" | "partial" | "failed";
  stepResults: Array<{
    stepKey: string;
    handler: string;
    status: "success" | "partial" | "failed";
    summary: string;
  }>;
  outputs: {
    experimental?: AgentOutput<ExperimentalResult>;
    review?: AgentOutput<unknown>;
    reflection?: AgentOutput<unknown>;
  };
};

export async function runWorkflow(
  input: RunWorkflowInput
): Promise<RunWorkflowResult> {
  const workflow = input.workflow ?? songIdeationWorkflow;
  const stepResults: RunWorkflowResult["stepResults"] = [];

  let experimentalOutput: AgentOutput<ExperimentalResult> | undefined;
  let reviewOutput: AgentOutput<unknown> | undefined;
  let reflectionOutput: AgentOutput<unknown> | undefined;

  for (const step of workflow.steps) {
    if (step.handler === "experimental-agent") {
      experimentalOutput = await experimentalAgent.run({
        runId: input.runId,
        userId: input.userId,
        projectId: input.projectId,
        context: {},
        task: {
          target: "hook",
          brief: input.brief,
          variationCount: 3,
          riskLevel: "medium"
        },
        constraints: {
          language: input.language ?? "no",
          genre: input.genre ?? "cinematic trap",
          tone: input.tone ?? "dark",
          plan: "pro",
          maxTokens: 1200
        }
      });

      stepResults.push({
        stepKey: step.key,
        handler: step.handler,
        status: experimentalOutput.status,
        summary: experimentalOutput.summary
      });

      continue;
    }

    if (step.handler === "think-tank-agent" && experimentalOutput) {
      const reviewTask: ThinkTankTask = {
        evaluateTarget: "artifact",
        criteria: [
          "originality",
          "genre-fit",
          "emotional-coherence",
          "hook-potential"
        ],
        candidate: experimentalOutput.result
      };

      reviewOutput = await thinkTankAgent.run({
        runId: `${input.runId}_review`,
        userId: input.userId,
        projectId: input.projectId,
        context: {},
        task: reviewTask,
        constraints: {
          language: input.language ?? "no",
          genre: input.genre ?? "cinematic trap",
          tone: input.tone ?? "dark",
          plan: "pro",
          maxTokens: 1000
        }
      });

      stepResults.push({
        stepKey: step.key,
        handler: step.handler,
        status: reviewOutput.status,
        summary: reviewOutput.summary
      });

      continue;
    }

    if (step.handler === "reflective-agent" && experimentalOutput) {
      const acceptedTitle =
        experimentalOutput.result.options[0]?.title ?? "Untitled option";

      const reflectiveTask: ReflectiveTask = {
        sourceRunId: input.runId,
        acceptedArtifacts: [acceptedTitle],
        rejectedArtifacts: experimentalOutput.result.options
          .slice(1)
          .map((option) => option.title),
        userFeedback:
          "User explored darker cinematic directions and leaned toward emotionally open hook concepts."
      };

      reflectionOutput = await reflectiveAgent.run({
        runId: `${input.runId}_reflect`,
        userId: input.userId,
        projectId: input.projectId,
        context: {},
        task: reflectiveTask,
        constraints: {
          language: input.language ?? "no",
          genre: input.genre ?? "cinematic trap",
          tone: input.tone ?? "dark",
          plan: "pro",
          maxTokens: 900
        }
      });

      stepResults.push({
        stepKey: step.key,
        handler: step.handler,
        status: reflectionOutput.status,
        summary: reflectionOutput.summary
      });
    }
  }

  const hasFailure = stepResults.some((step) => step.status === "failed");
  const hasPartial = stepResults.some((step) => step.status === "partial");

  return {
    workflowKey: workflow.key,
    status: hasFailure ? "failed" : hasPartial ? "partial" : "success",
    stepResults,
    outputs: {
      experimental: experimentalOutput,
      review: reviewOutput,
      reflection: reflectionOutput
    }
  };
}
