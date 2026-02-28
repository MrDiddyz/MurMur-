import type { Trigger } from "./detector";
import type { EvolutionStore } from "./store";
import type { EvolutionProposal } from "./types";
import type { EvolutionIssue } from "./detector";

function triggerToProposalDraft(trigger: Trigger): Omit<EvolutionProposal, "id" | "status"> {
  const now = new Date().toISOString();

  if (trigger.kind === "degradation") {
    return {
      title: `Recover ${trigger.metricKey} degradation`,
      hypothesis: `Improving controls for ${trigger.metricKey} should recover from ${trigger.currentAvg.toFixed(4)} toward ${trigger.baselineAvg.toFixed(4)}.`,
      changeType: "config",
      patch: {
        metricKey: trigger.metricKey,
        action: "tune_control_loop",
        target: trigger.baselineAvg
      },
      evidence: {
        trigger
      },
      createdAt: now,
      updatedAt: now
    };
  }

  return {
    title: `Break ${trigger.metricKey} stagnation`,
    hypothesis: `Introducing exploration for ${trigger.metricKey} should improve movement from stagnant average ${trigger.windowAvg.toFixed(4)}.`,
    changeType: "policy",
    patch: {
      metricKey: trigger.metricKey,
      action: "increase_exploration"
    },
    evidence: {
      trigger
    },
    createdAt: now,
    updatedAt: now
  };
}

export async function proposeFromTriggers(
  store: EvolutionStore,
  args: {
    userId?: string;
    triggers: Trigger[];
  }
): Promise<EvolutionProposal[]> {
  const proposals: EvolutionProposal[] = [];

  for (const trigger of args.triggers) {
    const draft = triggerToProposalDraft(trigger);
    const created = await store.createProposal({ ...draft, userId: args.userId });
    proposals.push(created);
  }

  return proposals;
}

export class EvolutionProposer {
  propose(issues: EvolutionIssue[]): EvolutionProposal[] {
    const now = new Date().toISOString();

    return issues.map((issue) => {
      const payload = this.mapIssue(issue);

      return {
        id: crypto.randomUUID(),
        status: "draft",
        title: payload.title,
        hypothesis: payload.hypothesis,
        changeType: payload.changeType,
        patch: payload.patch,
        evidence: {
          metricKey: issue.observation.metricKey,
          metricValue: issue.observation.metricValue,
          source: issue.observation.source,
          severity: issue.severity
        },
        createdAt: now,
        updatedAt: now
      };
    });
  }

  private mapIssue(issue: EvolutionIssue): Pick<EvolutionProposal, "title" | "hypothesis" | "changeType" | "patch"> {
    switch (issue.code) {
      case "LATENCY":
        return {
          title: "Reduce request fanout for hot endpoints",
          hypothesis: "Adding tighter cache policy will reduce tail latency while maintaining correctness.",
          changeType: "config",
          patch: { service: "api", setting: "cache_ttl_seconds", from: 0, to: 15 }
        };
      case "SUCCESS_RATE":
        return {
          title: "Improve agent retry policy",
          hypothesis: "A bounded retry with backoff increases task completion on transient failures.",
          changeType: "policy",
          patch: { component: "pilot", policy: "retry", maxAttempts: 2, backoffMs: 250 }
        };
      case "ERROR_RATE":
      default:
        return {
          title: "Enable guarded feature flag",
          hypothesis: "Restricting error-prone flow to a cohort lowers global error rate.",
          changeType: "feature_flag",
          patch: { flag: "new-flow", rollout: 0.25 }
        };
    }
  }
}
