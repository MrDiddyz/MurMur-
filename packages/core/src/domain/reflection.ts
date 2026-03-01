export type ReflectionDomain = {
  id: string;
  name: string;
  objective: string;
};

const REFLECTION_DOMAINS: ReflectionDomain[] = [
  {
    id: "cognition",
    name: "Cognitive Calibration",
    objective: "Continuously map learner intent to adaptive instructional pathways."
  },
  {
    id: "feedback",
    name: "Signal Feedback",
    objective: "Transform weak signals into real-time product and pedagogy actions."
  },
  {
    id: "governance",
    name: "Trust Governance",
    objective: "Enforce explainable, auditable interventions at scale."
  }
];

export function listReflectionDomains(): ReflectionDomain[] {
  return REFLECTION_DOMAINS;
}

export function buildReflectionBrief(instanceId: string): { instanceId: string; summary: string } {
  return {
    instanceId,
    summary:
      "Nala orchestration is converging reflection telemetry with intervention quality metrics across all learning cohorts."
  };
}
