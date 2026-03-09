export type ModuleCategory = 'Business' | 'Creative' | 'Personal' | 'Systems';

export type LearningModule = {
  slug: string;
  name: string;
  category: ModuleCategory;
  description: string;
  outcomes: string[];
  timeline: string;
  priceFrom: string;
};
