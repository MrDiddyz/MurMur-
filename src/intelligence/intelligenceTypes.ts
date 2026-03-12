export type FragmentSource = 'note' | 'task' | 'message' | 'bookmark' | 'voice';

export type FragmentCategory =
  | 'research'
  | 'product'
  | 'creative'
  | 'engineering'
  | 'operations'
  | 'learning'
  | 'uncertain';

export interface FragmentInput {
  id: string;
  text: string;
  createdAt: string;
  source: FragmentSource;
  tags?: string[];
}

export interface ClassifiedFragment extends FragmentInput {
  category: FragmentCategory;
  confidence: number;
  matchedKeywords: string[];
}

export interface FragmentCluster {
  id: string;
  category: FragmentCategory;
  fragmentIds: string[];
  representativeKeywords: string[];
  cohesion: number;
}

export type IdeaStrength = 'weak' | 'medium' | 'strong';

export interface DetectedIdea {
  id: string;
  title: string;
  summary: string;
  strength: IdeaStrength;
  category: FragmentCategory;
  fragmentIds: string[];
  rationale: string[];
}

export interface SynthesizedProject {
  id: string;
  name: string;
  description: string;
  category: FragmentCategory;
  supportingIdeaIds: string[];
  supportingFragmentIds: string[];
  nextActions: string[];
  confidence: number;
}

export interface IntelligenceResult {
  inputCount: number;
  classifiedFragments: ClassifiedFragment[];
  clusters: FragmentCluster[];
  ideas: DetectedIdea[];
  projects: SynthesizedProject[];
  summary: {
    topCategory: FragmentCategory;
    averageClassificationConfidence: number;
    generatedAt: string;
  };
}
