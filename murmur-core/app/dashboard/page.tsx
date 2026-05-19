import { OverviewGrid } from "@/components/dashboard/overview-grid";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <OverviewGrid />
    </div>
  );
}
