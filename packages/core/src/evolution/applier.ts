import type { EvolutionStore } from "./store";
import type { EvolutionProposal } from "./types";

function deepMerge(target: unknown, patch: unknown): unknown {
  if (patch === null || patch === undefined) return target;
  if (Array.isArray(patch) || typeof patch !== "object") return patch;

  const out: Record<string, unknown> = { ...((target as Record<string, unknown> | undefined) ?? {}) };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    out[k] = deepMerge(out[k], v);
  }
  return out;
}

export async function applyProposal(
  store: EvolutionStore,
  args: {
    userId?: string;
    proposal: EvolutionProposal;
  }
): Promise<{ newBaseline: Record<string, unknown> }> {
  const current = (await store.getActiveBaseline({ userId: args.userId })) ?? {};
  const next = deepMerge(current, args.proposal.patch) as Record<string, unknown>;

  await store.setActiveBaseline({
    userId: args.userId,
    proposalId: args.proposal.id,
    baseline: next
  });

  await store.updateProposal(args.proposal.id, {
    status: "applied",
    updatedAt: new Date().toISOString()
  });

  return { newBaseline: next };
}
