export type CoreAgent = {
  id: string;
  name: string;
  capability: string;
};

const CORE_AGENTS: CoreAgent[] = [
  {
    id: "sentinel",
    name: "Sentinel Agent",
    capability: "Monitors intervention drift and escalation thresholds."
  },
  {
    id: "scribe",
    name: "Scribe Agent",
    capability: "Builds explainable summaries for operator and learner interfaces."
  },
  {
    id: "pulse",
    name: "Pulse Agent",
    capability: "Scores real-time learning momentum and confidence trajectories."
  }
];

export function listCoreAgents(): CoreAgent[] {
  return CORE_AGENTS;
}
