import { CouncilAgentSchema, CouncilOutputSchema } from "@/lib/validation/council";

const AGENTS = ["Reality Agent", "Revenue Agent", "Systems Agent", "Care Agent", "Creative Agent"];

export async function runCouncil(topic: string) {
  const perspectives = AGENTS.map((agent, i) => CouncilAgentSchema.parse({
    agent, perspective: `${agent} sees ${topic} through a distinct lens`, score: 65 + i * 5,
    risk: "Assumptions not tested against reality", opportunity: "Focused iteration loop", recommendation: "Run a 7-day validation sprint"
  }));
  const final = CouncilOutputSchema.parse({ summary: "Council identified execution discipline as core leverage.", priority_score: 82, main_risk: perspectives[0].risk, main_opportunity: perspectives[1].opportunity, recommended_next_step: "Ship one measurable experiment this week." });
  return { perspectives, final };
}
