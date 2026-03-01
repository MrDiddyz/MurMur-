import type { Agent, AgentRunContext, AgentStructuredOutput } from "./types";

function excerpt(input: string): string {
  const normalized = input.trim();
  if (normalized.length <= 120) return normalized;
  return `${normalized.slice(0, 117)}...`;
}

abstract class BaseAgent implements Agent {
  abstract id: "pilot" | "weaver" | "mirror";

  async run(context: AgentRunContext): Promise<AgentStructuredOutput> {
    return this.createOutput(context.input);
  }

  protected abstract createOutput(input: string): AgentStructuredOutput;
}

export class PilotAgent extends BaseAgent {
  id = "pilot" as const;

  protected createOutput(input: string): AgentStructuredOutput {
    return {
      plan: `Define objective and constraints for: ${excerpt(input)}. Break work into 2-3 milestones with owners and timing.`,
      code: "Sketch implementation shape, data flow, and API boundaries before writing production code.",
      test: "Validate acceptance criteria with a happy-path check plus one edge-case regression.",
      nextStep: "Start milestone 1 and capture assumptions that need stakeholder confirmation."
    };
  }
}

export class WeaverAgent extends BaseAgent {
  id = "weaver" as const;

  protected createOutput(input: string): AgentStructuredOutput {
    return {
      plan: `Compose reusable modules around: ${excerpt(input)}. Prioritize interfaces that reduce coupling.`,
      code: "Implement shared primitives first, then integrate orchestration logic in thin adapters.",
      test: "Run integration-focused checks to ensure modules compose correctly across boundaries.",
      nextStep: "Refactor duplicated logic into utilities and document extension points."
    };
  }
}

export class MirrorAgent extends BaseAgent {
  id = "mirror" as const;

  protected createOutput(input: string): AgentStructuredOutput {
    return {
      plan: `Review intent for: ${excerpt(input)} and identify ambiguous requirements before execution.`,
      code: "Produce a minimal implementation, then compare behavior against stated intent and risks.",
      test: "Add assertions that capture expected outcomes and one negative scenario to expose blind spots.",
      nextStep: "Summarize deltas between intent and implementation, then request feedback on unresolved trade-offs."
    };
  }
}
