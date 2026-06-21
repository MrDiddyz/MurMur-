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
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          MurMur Graph View
        </h2>
        <p className="text-sm text-neutral-500">
          Live pipeline for the current run
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
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
          <p className="font-medium text-neutral-900">{label}</p>
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

      <div className="mt-3 text-sm text-neutral-600">
        {summary ? (
          <p>{summary}</p>
        ) : (
          <p className="italic text-neutral-400">No summary yet.</p>
        )}
      </div>
    </div>
  );
}

function GraphEdge({ nextStatus }: { nextStatus: StepStatus }) {
  return (
    <div className="flex items-center justify-center px-2 py-2 md:flex-1 md:px-3">
      <div className="flex w-full items-center md:min-w-[48px]">
        <div
          className={`h-px flex-1 border-t-2 border-dashed ${getEdgeTone(
            nextStatus
          )}`}
        />
        <span
          className={`mx-2 text-xs font-medium ${getEdgeLabelTone(nextStatus)}`}
        >
          {getEdgeLabel(nextStatus)}
        </span>
        <div
          className={`h-px flex-1 border-t-2 border-dashed ${getEdgeTone(
            nextStatus
          )}`}
        />
      </div>
    </div>
  );
}

function getNodeTone(status: StepStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "running":
      return "border-blue-200 bg-blue-50 text-blue-950";
    case "failed":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "skipped":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "cancelled":
      return "border-neutral-300 bg-neutral-100 text-neutral-700";
    case "pending":
    default:
      return "border-neutral-200 bg-white text-neutral-900";
  }
}

function getBadgeTone(status: StepStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-300 bg-emerald-100 text-emerald-800";
    case "running":
      return "border-blue-300 bg-blue-100 text-blue-800";
    case "failed":
      return "border-rose-300 bg-rose-100 text-rose-800";
    case "skipped":
      return "border-amber-300 bg-amber-100 text-amber-800";
    case "cancelled":
      return "border-neutral-300 bg-neutral-200 text-neutral-700";
    case "pending":
    default:
      return "border-neutral-300 bg-neutral-100 text-neutral-700";
  }
}

function getNodeIcon(status: StepStatus) {
  switch (status) {
    case "completed":
      return "✅";
    case "running":
      return "⏳";
    case "failed":
      return "❌";
    case "skipped":
      return "⏭️";
    case "cancelled":
      return "🚫";
    case "pending":
    default:
      return "🕒";
  }
}

function getEdgeTone(status: StepStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-400";
    case "running":
      return "border-blue-400";
    case "failed":
      return "border-rose-400";
    case "skipped":
      return "border-amber-400";
    case "cancelled":
      return "border-neutral-400";
    case "pending":
    default:
      return "border-neutral-300";
  }
}

function getEdgeLabelTone(status: StepStatus) {
  switch (status) {
    case "completed":
      return "text-emerald-700";
    case "running":
      return "text-blue-700";
    case "failed":
      return "text-rose-700";
    case "skipped":
      return "text-amber-700";
    case "cancelled":
      return "text-neutral-600";
    case "pending":
    default:
      return "text-neutral-400";
  }
}

function getEdgeLabel(status: StepStatus) {
  switch (status) {
    case "running":
      return "active";
    case "completed":
      return "done";
    case "failed":
      return "error";
    case "skipped":
      return "skip";
    case "cancelled":
      return "stop";
    case "pending":
    default:
      return "next";
  }
}

function formatStatus(status: StepStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
