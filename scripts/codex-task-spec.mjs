const MODULE_MAP = {
  billing: "backend/billing",
  frontend: "frontend",
  rl: "optimizer/rl-engine",
  agents: "agents",
  scheduler: "backend/scheduler",
};

export function mapModule(module) {
  return MODULE_MAP[module] || "backend";
}

export function deriveConstraints(proposal) {
  if (proposal.module === "billing") {
    return "No modification to Stripe core payment API";
  }

  if (proposal.module === "rl") {
    return "Do not alter reward baseline without Operator approval";
  }

  return "Follow repository modular standards";
}

export function convertProposalToCodexTask(proposal) {
  return {
    task_type: "feature",
    target_module: mapModule(proposal.module),
    objective: proposal.proposed_solution,
    constraints: deriveConstraints(proposal),
    test_required: true,
    auto_generated: true,
    proposal_id: proposal.id,
  };
}
