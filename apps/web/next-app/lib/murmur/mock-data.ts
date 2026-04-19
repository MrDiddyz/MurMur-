import type { CommunityRole, LessonProgress, MembershipTier } from '@/lib/murmur/domain';

export interface DemoMember {
  id: string;
  name: string;
  tier: MembershipTier;
  role: CommunityRole;
  currentLevel: string;
  nextLesson: string;
  recentActivity: string[];
}

export const demoMember: DemoMember = {
  id: 'user_demo_001',
  name: 'Sigrid Operator',
  tier: 'guided',
  role: 'practitioner',
  currentLevel: 'Level 2 · Cognitive Systems',
  nextLesson: 'Module 2.3 · Strategic Reflection Loops',
  recentActivity: ['Completed lesson 2.2', 'Submitted weekly challenge', 'Shared progress in community'],
};

export const demoLessonProgress: LessonProgress[] = [
  { lessonId: 'l_101', userId: 'user_demo_001', completed: true, assignmentSubmitted: true, completedAt: '2026-02-20' },
  { lessonId: 'l_102', userId: 'user_demo_001', completed: true, assignmentSubmitted: false, completedAt: '2026-02-21' },
  { lessonId: 'l_103', userId: 'user_demo_001', completed: true, assignmentSubmitted: true, completedAt: '2026-02-22' },
  { lessonId: 'l_104', userId: 'user_demo_001', completed: true, assignmentSubmitted: true, completedAt: '2026-02-23' },
  { lessonId: 'l_105', userId: 'user_demo_001', completed: false, assignmentSubmitted: false },
  { lessonId: 'l_106', userId: 'user_demo_001', completed: false, assignmentSubmitted: false },
];
