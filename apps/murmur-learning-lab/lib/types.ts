export interface Reflection {
  id: string;
  content: string;
  mirror: string;
  insight: string;
  next_step: string;
  creative_suggestion: string;
  created_at: string;
}

export interface LearningNode {
  id: string;
  reflection_id: string;
  title: string;
  summary: string;
  tags: string[];
  created_at: string;
}

export interface AIResponse {
  mirror: string;
  insight: string;
  next_step: string;
  creative_suggestion: string;
}
