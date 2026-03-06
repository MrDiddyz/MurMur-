import { Handle, Position } from "reactflow";

import { type AgentNodeData, getHeatColor, getHeatScore } from "@/lib/agent-heatmap";

export function AgentHeatmapNode({ data }: { data: AgentNodeData }) {
  const heatScore = getHeatScore(data.metrics);
  const heatTone = getHeatColor(heatScore);

  return (
    <div className={`w-[240px] rounded-xl border p-4 shadow ${heatTone}`}>
      <Handle type="target" position={Position.Left} />

      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{data.label}</div>
          <div className="text-xs opacity-80">{data.status}</div>
        </div>

        <div className="text-xs font-medium">{(heatScore * 100).toFixed(0)}%</div>
      </div>

      {data.summary ? <p className="mt-2 text-xs opacity-90">{data.summary}</p> : null}

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div>Runtime: {data.metrics.runtimeMs}ms</div>
        <div>Execs: {data.metrics.executions}</div>
        <div>Tokens: {data.metrics.inputTokens + data.metrics.outputTokens}</div>
        <div>Errors: {data.metrics.errors}</div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export function HeatmapLegend() {
  const items = [
    { label: "Low", cls: "bg-emerald-200" },
    { label: "Moderate", cls: "bg-lime-300" },
    { label: "Elevated", cls: "bg-yellow-400" },
    { label: "High", cls: "bg-orange-500" },
    { label: "Critical", cls: "bg-red-500" },
  ];

  return (
    <div className="rounded-lg border bg-white p-3 text-xs shadow dark:bg-neutral-900">
      <div className="mb-2 font-semibold">Execution Heatmap</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded ${item.cls}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
