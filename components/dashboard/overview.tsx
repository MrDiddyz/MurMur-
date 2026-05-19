import { Card } from "@/components/ui/card";

export function DashboardOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Recent Runs">Signal and council executions appear here.</Card>
      <Card title="Priority Insights">High-value opportunities and risks.</Card>
      <Card title="Activity Timeline">Event stream ordered by timestamp.</Card>
      <Card title="Signal Summaries">Latest extracted core signals.</Card>
    </div>
  );
}
