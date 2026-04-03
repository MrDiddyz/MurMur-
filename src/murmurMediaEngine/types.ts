export type Timestamped = {
  id: string;
  timestamp: string;
  correlationId: string;
};

export type Source = Timestamped & {
  name: string;
  kind: "rss" | "web" | "manual";
  url?: string;
};

export type RawArticle = Timestamped & {
  sourceId: string;
  title: string;
  body: string;
  publishedAt?: string;
};

export type EmotionTone = "positive" | "negative" | "neutral";

export type Signal = Timestamped & {
  rawArticleId: string;
  trendKeywords: string[];
  anomalyFlags: string[];
  emotionalTone: EmotionTone;
  repetitionPatterns: string[];
  weight: number;
};

export type Narrative = Timestamped & {
  title: string;
  theme: string;
  signalIds: string[];
  confidence: number;
  score: number;
  feedback: string;
};

export type Report = Timestamped & {
  narrativeIds: string[];
  summary: string;
  shortInsights: string[];
  whatMattersNow: string;
};

export type DeadLetter = Timestamped & {
  step: PipelineStep;
  reason: string;
  payload: unknown;
};

export type PipelineStep =
  | "fetch"
  | "parse"
  | "scan"
  | "cluster"
  | "analyze"
  | "generate"
  | "store";

export type PipelineInput = {
  source?: Omit<Source, keyof Timestamped | "name"> & { name?: string };
  articles: Array<Pick<RawArticle, "title" | "body" | "publishedAt">>;
};

export type PipelineStepLog = Timestamped & {
  step: PipelineStep;
  status: "ok" | "error";
  details: Record<string, unknown>;
};

export type MurmurTables = {
  sources: Source[];
  raw_articles: RawArticle[];
  signals: Signal[];
  narratives: Narrative[];
  reports: Report[];
  dead_letters: DeadLetter[];
  pipeline_logs: PipelineStepLog[];
};
