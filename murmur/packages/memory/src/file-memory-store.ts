import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import type { MemoryEntry, MemoryQuery } from "@murmur/shared";
import type { MemoryStore, MemoryWriteInput } from "./types.js";

interface MemoryFileShape {
  entries: MemoryEntry[];
}

export class FileMemoryStore implements MemoryStore {
  constructor(private readonly filePath: string) {}

  async write(entry: MemoryWriteInput): Promise<MemoryEntry> {
    const data = await this.load();
    const record: MemoryEntry = {
      id: randomUUID(),
      runId: entry.runId,
      workflowId: entry.workflowId,
      type: entry.type,
      key: entry.key,
      value: entry.value,
      createdAt: new Date().toISOString(),
      sourceAgent: entry.sourceAgent,
      relevance: entry.relevance,
      tags: entry.tags ?? []
    };
    data.entries.push(record);
    await this.save(data);
    return record;
  }

  async search(query: MemoryQuery): Promise<MemoryEntry[]> {
    const data = await this.load();
    const objectiveTokens = (query.objective ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    const scored = data.entries
      .filter((entry) => {
        if (query.workflowId && entry.workflowId !== query.workflowId) return false;
        if (query.tags?.length && !query.tags.some((tag) => entry.tags.includes(tag))) return false;
        return true;
      })
      .map((entry) => {
        const haystack = `${entry.key} ${JSON.stringify(entry.value)}`.toLowerCase();
        const tokenHits = objectiveTokens.reduce((acc, token) => (haystack.includes(token) ? acc + 1 : acc), 0);
        const recencyBonus = Date.now() - Date.parse(entry.createdAt) < 1000 * 60 * 60 * 24 * 7 ? 10 : 0;
        const score = entry.relevance * 100 + tokenHits * 5 + recencyBonus;
        return { entry, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.entry);

    return scored.slice(0, query.limit ?? 8);
  }

  async listByRun(runId: string): Promise<MemoryEntry[]> {
    const data = await this.load();
    return data.entries.filter((entry) => entry.runId === runId);
  }

  async listRecent(limit: number): Promise<MemoryEntry[]> {
    const data = await this.load();
    return [...data.entries]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, limit);
  }

  async prune(maxEntries = 2000): Promise<void> {
    const data = await this.load();
    if (data.entries.length <= maxEntries) return;
    data.entries = data.entries
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, maxEntries);
    await this.save(data);
  }

  private async load(): Promise<MemoryFileShape> {
    await mkdir(dirname(this.filePath), { recursive: true });
    try {
      const content = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(content) as MemoryFileShape;
      return { entries: parsed.entries ?? [] };
    } catch {
      return { entries: [] };
    }
  }

  private async save(data: MemoryFileShape): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }
}
