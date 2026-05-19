import { Card } from "@/components/ui/card";

export default function CouncilPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Council</h1>
      <Card title="Council Engine">Run multi-agent reasoning via /api/council/run.</Card>
    </div>
  );
}
