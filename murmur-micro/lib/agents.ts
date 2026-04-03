export type AgentName = "TeacherAgent" | "ExperimentalAgent" | "ThinkTankAgent" | "ReflectiveAgent";

export type AgentResult = {
  agent: AgentName;
  output: string;
};

type AgentFn = (input: string) => string;

const agents: Record<AgentName, AgentFn> = {
  TeacherAgent: (input) =>
    `Structured guidance:\n1) Clarify objective for: ${input}.\n2) Define a tiny experiment.\n3) Execute and measure.`,
  ExperimentalAgent: (input) =>
    `Wildcard idea: Reframe "${input}" as a 48-hour challenge, then compare two opposite tactics and record outcomes.`,
  ThinkTankAgent: (input) =>
    `Team strategy for ${input}: align stakeholders, define risks, identify leverage points, and ship an incremental milestone.`,
  ReflectiveAgent: (input) =>
    `Reflection loop for ${input}: what worked, what failed, what surprised us, and the single highest-impact next step.`
};

export function runAgents(input: string): AgentResult[] {
  return (Object.keys(agents) as AgentName[]).map((agent) => ({
    agent,
    output: agents[agent](input)
  }));
}
