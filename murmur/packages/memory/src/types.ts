import type { MemoryEntry, MemoryQuery, ReflectionMemory } from "@murmur/shared";

export interface MemoryWriteInput extends ReflectionMemory {
  runId: string;
  workflowId: string;
  sourceAgent: "reflective" | "evaluator" | "evolution";
}

export interface MemoryStore {
  write(entry: MemoryWriteInput): Promise<MemoryEntry>;
  search(query: MemoryQuery): Promise<MemoryEntry[]>;
  listByRun(runId: string): Promise<MemoryEntry[]>;
  listRecent(limit: number): Promise<MemoryEntry[]>;
  prune(maxEntries?: number): Promise<void>;
}
