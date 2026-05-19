import { Card } from "@/components/ui/card";

export function OverviewGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Recent Runs">Signal and council sessions appear here.</Card>
      <Card title="Priority Insights">Top leverage and risk items appear here.</Card>
      <Card title="Activity Timeline">Events feed from internal logger.</Card>
      <Card title="Signal Summaries">High-clarity extracted intelligence.</Card>
    </div>
  );
}
