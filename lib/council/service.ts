import { randomUUID } from "crypto";
import { councilRunSchema } from "@/lib/validation/council";
import { logEvent } from "@/lib/events/logger";

const agents = ["Reality Agent", "Revenue Agent", "Systems Agent", "Care Agent", "Creative Agent"] as const;

export async function runCouncil(input: unknown) {
  const payload = councilRunSchema.parse(input);
  const agent_outputs = agents.map((agent, idx) => ({
    agent,
    perspective: `${agent} perspective on ${payload.context.slice(0, 40)}`,
    score: 65 + idx * 5,
    risk: "Overconfidence without validation",
    opportunity: "Sharper prioritization",
    recommendation: "Run a small constrained experiment"
  }));
  const final = {
    summary: "Council sees upside if execution discipline improves.",
    priority_score: 79,
    main_risk: "Strategy drift from unclear sequencing",
    main_opportunity: "Leverage clear communication as force multiplier",
    recommended_next_step: "Define one metric and owner before next iteration"
  };
  logEvent({ event_id: randomUUID(), type: "council_completed", source: "council.service", timestamp: new Date().toISOString(), user_id: "system", payload: { projectId: payload.projectId } });
  return { agent_outputs, final };
}
