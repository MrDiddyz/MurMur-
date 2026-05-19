import { DashboardOverview } from "@/components/dashboard/overview";
import { Shell } from "@/components/layout/shell";

export default function DashboardPage() {
  return (
    <Shell title="Dashboard">
      <DashboardOverview />
    </Shell>
  );
}
