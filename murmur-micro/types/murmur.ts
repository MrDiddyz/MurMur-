export type AgentName = "idea" | "critic" | "synth" | "judge";

export interface AgentResult {
  agent: AgentName;
  input: string;
  output: string;
  score?: number;
}

export interface MurmurRunResult {
  final: string;
  winner: "idea" | "synth";
  rationale: string;
  score: number;
  trace: AgentResult[];
}

export interface RunApiResponse extends MurmurRunResult {
  episodeId: string;
}

export type FeedbackValue = 1 | -1;
