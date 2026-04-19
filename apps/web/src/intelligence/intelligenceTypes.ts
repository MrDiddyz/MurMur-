export type FragmentStatus = "raw" | "triaged" | "archived";

export enum FragmentCategory {
  Vision = "vision",
  Feature = "feature",
  Architecture = "architecture",
  Workflow = "workflow",
  Monetization = "monetization",
  Research = "research",
  Branding = "branding",
  Community = "community",
  System = "system",
  Misc = "misc",
}

export interface FragmentMetadata {
  author?: string;
  channel?: string;
  language?: string;
  priority?: "low" | "medium" | "high";
  relatedFragmentIds?: string[];
  signals?: string[];
  categoryReasoning?: string[];
  normalizedContent?: string;
  keywords?: string[];
}

export interface Fragment {
  id: string;
  content: string;
  source: string;
  createdAt: string;
  tags: string[];
  status: FragmentStatus;
  confidence?: number;
  metadata?: FragmentMetadata;
}

export interface ClassifiedFragment extends Fragment {
  category: FragmentCategory;
  confidence: number;
  classificationReasoning: string[];
}

export interface FragmentCluster {
  id: string;
  label: string;
  fragmentIds: string[];
  summary: string;
  dominantCategories: FragmentCategory[];
  confidenceScore: number;
}

export interface ClusterScoring {
  coherenceScore: number;
  usefulnessScore: number;
  buildabilityScore: number;
  distinctivenessScore: number;
}

export interface ProjectCandidate {
  id: string;
  title: string;
  summary: string;
  fragmentIds: string[];
  opportunityScore: number;
  noveltyScore: number;
  executionScore: number;
  recommendedNextStep: string;
  scoring: ClusterScoring;
}

export interface SynthesizedProject {
  title: string;
  oneLiner: string;
  problem: string;
  solution: string;
  targetUser: string;
  keyFeatures: string[];
  architectureNotes: string[];
  roadmap: string[];
  repoStructureSuggestion: string[];
}

export interface IntelligenceInsight {
  type: "signal" | "risk" | "opportunity";
  message: string;
}

export interface IntelligenceResult {
  classifiedFragments: ClassifiedFragment[];
  clusters: FragmentCluster[];
  projectCandidates: ProjectCandidate[];
  synthesizedProjects: SynthesizedProject[];
  insights: IntelligenceInsight[];
  suggestedActions: string[];
}
