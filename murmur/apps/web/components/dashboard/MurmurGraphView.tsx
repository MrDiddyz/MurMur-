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
    <div className="rounded-2xl border p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">MurMur Graph View</h2>
        <p className="text-sm text-neutral-500">
          Live pipeline for the current run
        </p>
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
      className={`min-w-[180px] rounded-2xl border p-4 transition ${getNodeTone(
        status
      )}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-500">Agent</p>
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
          {formatStatus(status)}
        </span>
      </div>

      <p className="mt-3 text-sm text-neutral-600">{summary ?? "Awaiting execution"}</p>
    </div>
  );
}

function GraphEdge({ nextStatus }: { nextStatus: StepStatus }) {
  return (
    <div className="mx-2 my-2 h-px flex-1 bg-neutral-300 md:my-0 md:h-0.5">
      <div
        className={`h-full w-full rounded ${
          nextStatus === "running" || nextStatus === "completed"
            ? "bg-blue-500"
            : nextStatus === "failed"
            ? "bg-red-500"
            : nextStatus === "cancelled"
            ? "bg-orange-500"
            : "bg-neutral-300"
        }`}
      />
    </div>
  );
}

function formatStatus(status: StepStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getNodeIcon(status: StepStatus) {
  switch (status) {
    case "pending":
      return "○";
    case "running":
      return "◔";
    case "completed":
      return "✓";
    case "failed":
      return "✕";
    case "skipped":
      return "↷";
    case "cancelled":
      return "⊘";
    default:
      return "•";
  }
}

function getNodeTone(status: StepStatus) {
  switch (status) {
    case "running":
      return "border-blue-200 bg-blue-50";
    case "completed":
      return "border-emerald-200 bg-emerald-50";
    case "failed":
      return "border-red-200 bg-red-50";
    case "skipped":
      return "border-amber-200 bg-amber-50";
    case "cancelled":
      return "border-orange-200 bg-orange-50";
    case "pending":
    default:
      return "border-neutral-200 bg-white";
  }
}

function getBadgeTone(status: StepStatus) {
  switch (status) {
    case "running":
      return "border-blue-300 bg-blue-100 text-blue-700";
    case "completed":
      return "border-emerald-300 bg-emerald-100 text-emerald-700";
    case "failed":
      return "border-red-300 bg-red-100 text-red-700";
    case "skipped":
      return "border-amber-300 bg-amber-100 text-amber-700";
    case "cancelled":
      return "border-orange-300 bg-orange-100 text-orange-700";
    case "pending":
    default:
      return "border-neutral-300 bg-neutral-100 text-neutral-700";
  }
}

export type { GraphStep, StepStatus };
