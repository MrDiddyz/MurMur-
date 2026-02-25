export type MembershipTier = 'core' | 'guided' | 'professional';

export type CommunityRole = 'explorer' | 'practitioner' | 'integrator' | 'certified' | 'ambassador';

export interface LearningHierarchy {
  trackId: string;
  levelId: string;
  moduleId: string;
  lessonId: string;
}

export interface LessonContent {
  videoUrl?: string;
  text: string;
  exerciseId?: string;
  reflectionPrompt?: string;
  quizId?: string;
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  completed: boolean;
  assignmentSubmitted: boolean;
  completedAt?: string;
}

export interface MembershipPlan {
  tier: MembershipTier;
  stripePriceId: string;
  monthlyPriceNok: number;
  includes: string[];
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    tier: 'core',
    stripePriceId: 'price_core_monthly',
    monthlyPriceNok: 690,
    includes: ['Structured learning path', 'Weekly focus topics', 'Progress tracking'],
  },
  {
    tier: 'guided',
    stripePriceId: 'price_guided_monthly',
    monthlyPriceNok: 1490,
    includes: ['Everything in Core', 'Guided practice labs', 'Certification preparation'],
  },
  {
    tier: 'professional',
    stripePriceId: 'price_professional_monthly',
    monthlyPriceNok: 3490,
    includes: ['Everything in Guided', 'Organization support', 'Ambassador rewards priority'],
  },
];

export const COMMUNITY_ROLE_LABELS: Record<CommunityRole, string> = {
  explorer: 'Explorer',
  practitioner: 'Practitioner',
  integrator: 'Integrator',
  certified: 'Certified',
  ambassador: 'Ambassador',
};
