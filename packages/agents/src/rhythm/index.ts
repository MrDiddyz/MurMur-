// rhythm-agent: infers beat-driven movement directives from audio/midi.
import type { AgentContract, AgentInput, AgentResult } from "@murmur/shared";

export const rhythmAgent: AgentContract = {
  id: "rhythm-agent",
  canRun: (input: AgentInput) => input.events.some((e) => e.type === "audio" || e.type === "midi"),
  async evaluate(input, context): Promise<AgentResult> {
    const beatEventCount = input.events.filter((e) => e.type === "audio" || e.type === "midi").length;
    const groove = Math.min(1, beatEventCount / 4) * context.memory.rhythmStrength;
    return {
      agentId: "rhythm-agent",
      confidence: 0.8,
      directives: {
        tempoSway: groove,
        beatPunch: groove * 0.9
      },
      reasoning: "Placeholder rhythm logic, ready for DSP integration."
    };
  }
};
