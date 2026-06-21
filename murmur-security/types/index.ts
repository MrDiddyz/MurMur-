export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface AnalysisResult {
  score: number;
  risk: RiskLevel;
  triggers: string[];
  reasoning: string;
  recommendation: string;
}

export interface ScanEntry {
  id: string;
  text: string;
  createdAt: string;
  result: AnalysisResult;
}
