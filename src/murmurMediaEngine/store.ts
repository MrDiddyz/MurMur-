import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  DeadLetter,
  MurmurTables,
  Narrative,
  PipelineStep,
  PipelineStepLog,
  RawArticle,
  Report,
  Signal,
  Source,
} from "./types";
import { makeId, nowIso } from "./utils";

const EMPTY_TABLES: MurmurTables = {
  sources: [],
  raw_articles: [],
  signals: [],
  narratives: [],
  reports: [],
  dead_letters: [],
  pipeline_logs: [],
};

export class MurmurStore {
  constructor(private readonly filePath: string) {
    mkdirSync(dirname(filePath), { recursive: true });
    if (!this.exists()) {
      this.write(EMPTY_TABLES);
    }
  }

  private exists() {
    try {
      readFileSync(this.filePath, "utf8");
      return true;
    } catch {
      return false;
    }
  }

  private read(): MurmurTables {
    return JSON.parse(readFileSync(this.filePath, "utf8")) as MurmurTables;
  }

  private write(data: MurmurTables) {
    writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }

  upsertSource(source: Omit<Source, "id" | "timestamp">): Source {
    const tables = this.read();
    const record: Source = { ...source, id: makeId("src"), timestamp: nowIso() };
    tables.sources.push(record);
    this.write(tables);
    return record;
  }

  addRawArticles(articles: Omit<RawArticle, "id" | "timestamp">[]): RawArticle[] {
    const tables = this.read();
    const records = articles.map((article) => ({
      ...article,
      id: makeId("raw"),
      timestamp: nowIso(),
    }));
    tables.raw_articles.push(...records);
    this.write(tables);
    return records;
  }

  addSignals(signals: Omit<Signal, "id" | "timestamp">[]): Signal[] {
    const tables = this.read();
    const records = signals.map((signal) => ({
      ...signal,
      id: makeId("sig"),
      timestamp: nowIso(),
    }));
    tables.signals.push(...records);
    this.write(tables);
    return records;
  }

  addNarratives(narratives: Omit<Narrative, "id" | "timestamp">[]): Narrative[] {
    const tables = this.read();
    const records = narratives.map((narrative) => ({
      ...narrative,
      id: makeId("nar"),
      timestamp: nowIso(),
    }));
    tables.narratives.push(...records);
    this.write(tables);
    return records;
  }

  addReport(report: Omit<Report, "id" | "timestamp">): Report {
    const tables = this.read();
    const record: Report = { ...report, id: makeId("rep"), timestamp: nowIso() };
    tables.reports.push(record);
    this.write(tables);
    return record;
  }

  logStep(entry: Omit<PipelineStepLog, "id" | "timestamp">): PipelineStepLog {
    const tables = this.read();
    const record: PipelineStepLog = {
      ...entry,
      id: makeId("log"),
      timestamp: nowIso(),
    };
    tables.pipeline_logs.push(record);
    this.write(tables);
    return record;
  }

  deadLetter(step: PipelineStep, correlationId: string, reason: string, payload: unknown): DeadLetter {
    const tables = this.read();
    const record: DeadLetter = {
      id: makeId("dlq"),
      timestamp: nowIso(),
      correlationId,
      step,
      reason,
      payload,
    };
    tables.dead_letters.push(record);
    this.write(tables);
    return record;
  }

  listReports(limit = 10): Report[] {
    return this.read().reports.slice(-limit).reverse();
  }

  listNarratives(limit = 20): Narrative[] {
    return this.read().narratives.slice(-limit).reverse();
  }

  listSignals(limit = 30): Signal[] {
    return this.read().signals.slice(-limit).reverse();
  }

  applyFeedback(narrativeId: string, score: number, feedback: string): Narrative | null {
    const tables = this.read();
    const idx = tables.narratives.findIndex((n) => n.id === narrativeId);
    if (idx < 0) return null;

    const narrative = tables.narratives[idx];
    const adjustedConfidence = Math.max(
      0,
      Math.min(1, narrative.confidence + (score - 0.5) * 0.2),
    );

    tables.narratives[idx] = {
      ...narrative,
      score,
      feedback,
      confidence: adjustedConfidence,
    };
    this.write(tables);
    return tables.narratives[idx];
  }
}

export const defaultStorePath = join(process.cwd(), "backend", "k", "data", "murmur-store.json");
