"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { clearScanHistory, deleteScanEntry, getScanHistory } from "@/lib/storage";
import type { ScanEntry } from "@/types";

export default function HistoryPage() {
  const [entries, setEntries] = useState<ScanEntry[]>([]);

  useEffect(() => {
    setEntries(getScanHistory());
  }, []);

  const scanCount = useMemo(() => entries.length, [entries]);

  const handleDelete = (id: string) => {
    deleteScanEntry(id);
    setEntries(getScanHistory());
  };

  const handleClearAll = () => {
    clearScanHistory();
    setEntries([]);
  };

  return (
    <div className="space-y-4 pb-10">
      <Card>
        <p className="text-xs uppercase tracking-[0.15em] text-gold">Overview</p>
        <p className="mt-2 text-3xl font-semibold">{scanCount}</p>
        <p className="text-sm text-zinc-400">Scans completed</p>
      </Card>

      <div className="flex justify-end">
        <Button variant="danger" className="w-auto px-4 py-2" onClick={handleClearAll} disabled={entries.length === 0}>
          Clear all history
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-400">No scans saved yet. Analyze a message to populate history.</p>
        </Card>
      ) : (
        entries.map((entry) => (
          <Card key={entry.id}>
            <div className="mb-2 flex items-center justify-between">
              <Badge risk={entry.result.risk} />
              <p className="text-xs text-zinc-500">{new Date(entry.createdAt).toLocaleString()}</p>
            </div>
            <p className="mb-2 text-sm text-zinc-200">{entry.text}</p>
            <p className="mb-3 text-xs text-zinc-400">Score {entry.result.score}/100</p>
            <Button variant="secondary" className="w-auto px-3 py-2 text-xs" onClick={() => handleDelete(entry.id)}>
              Delete entry
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}
