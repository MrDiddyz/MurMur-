import { Card } from "@/components/ui/card";

export default function SignalPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Signal</h1>
      <Card title="Signal Engine">Run analysis using /api/signal/analyze.</Card>
    </div>
  );
}
