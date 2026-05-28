"use client";

type StepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "cancelled";

type GraphStep = {
  id: string;
  agent: "planner" | "builder" | "reviewer" | "optimizer";
  status: StepStatus;
  summary?: string | null;
};

const AGENT_LABELS: Record<GraphStep["agent"], string> = {
  planner: "Planner",
  builder: "Builder",
  reviewer: "Reviewer",
  optimizer: "Optimizer",
};

export function MurmurGraphView({ steps }: { steps: GraphStep[] }) {
  const orderedAgents: GraphStep["agent"][] = [
    "planner",
    "builder",
    "reviewer",
    "optimizer",
  ];

  const orderedSteps = orderedAgents.map((agent, index) => {
    const match = steps.find((step) => step.agent === agent);

    return (
      match ?? {
        id: `placeholder-${agent}-${index}`,
        agent,
        status: "pending" as StepStatus,
        summary: null,
      }
    );
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0616]/40 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">MurMur Graph View</h2>
        <p className="text-sm text-neutral-400">Live pipeline for the current run</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {orderedSteps.map((step, index) => (
          <div
            key={step.id}
            className="flex flex-1 flex-col md:flex-row md:items-center"
          >
            <GraphNode
              label={AGENT_LABELS[step.agent]}
              status={step.status}
              summary={step.summary}
            />

            {index < orderedSteps.length - 1 ? (
              <GraphEdge nextStatus={orderedSteps[index + 1].status} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphNode({
  label,
  status,
  summary,
}: {
  label: string;
  status: StepStatus;
  summary?: string | null;
}) {
  return (
    <div
      className={`min-w-[180px] rounded-2xl border p-4 transition ${getNodeTone(status)}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-400">Agent</p>
          <p className="font-medium">{label}</p>
        </div>

        <div className="text-xl" aria-hidden="true">
          {getNodeIcon(status)}
        </div>
      </div>

      <div className="mt-3">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getBadgeTone(
            status
          )}`}
        >
          {getStatusLabel(status)}
        </span>
      </div>

      {summary ? <p className="mt-3 text-sm text-neutral-200">{summary}</p> : null}
    </div>
  );
}

function GraphEdge({ nextStatus }: { nextStatus: StepStatus }) {
  return (
    <div className="mx-2 hidden shrink-0 items-center md:flex" aria-hidden="true">
      <span className="block h-px w-6 bg-white/20" />
      <span className={`text-xs ${getEdgeTone(nextStatus)}`}>▶</span>
      <span className="block h-px w-6 bg-white/20" />
    </div>
  );
}

function getNodeTone(status: StepStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-400/40 bg-emerald-500/10";
    case "running":
      return "border-sky-400/40 bg-sky-500/10";
    case "failed":
      return "border-rose-400/40 bg-rose-500/10";
    case "cancelled":
      return "border-amber-400/40 bg-amber-500/10";
    case "skipped":
      return "border-zinc-400/40 bg-zinc-500/10";
    case "pending":
    default:
      return "border-white/10 bg-white/5";
  }
}

function getBadgeTone(status: StepStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-300/40 text-emerald-200";
    case "running":
      return "border-sky-300/40 text-sky-200";
    case "failed":
      return "border-rose-300/40 text-rose-200";
    case "cancelled":
      return "border-amber-300/40 text-amber-200";
    case "skipped":
      return "border-zinc-300/40 text-zinc-200";
    case "pending":
    default:
      return "border-white/20 text-white/70";
  }
}

function getEdgeTone(status: StepStatus) {
  switch (status) {
    case "running":
      return "text-sky-300";
    case "completed":
      return "text-emerald-300";
    case "failed":
      return "text-rose-300";
    case "cancelled":
      return "text-amber-300";
    case "pending":
    case "skipped":
    default:
      return "text-white/50";
  }
}

function getNodeIcon(status: StepStatus) {
  switch (status) {
    case "pending":
      return "○";
    case "running":
      return "◔";
    case "completed":
      return "●";
    case "failed":
      return "✕";
    case "skipped":
      return "⤼";
    case "cancelled":
      return "⊘";
    default:
      return "○";
  }
}

function getStatusLabel(status: StepStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "running":
      return "Running";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "skipped":
      return "Skipped";
    case "cancelled":
      return "Cancelled";
    default:
      return "Pending";
  }
}
