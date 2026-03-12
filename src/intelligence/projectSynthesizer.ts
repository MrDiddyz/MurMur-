import { toFixedNumber } from './intelligenceUtils';
import type { DetectedIdea, SynthesizedProject } from './intelligenceTypes';

const STRENGTH_MULTIPLIER: Record<DetectedIdea['strength'], number> = {
  weak: 0.7,
  medium: 0.85,
  strong: 1,
};

function nextActionsForCategory(category: DetectedIdea['category']): string[] {
  switch (category) {
    case 'research':
      return ['Draft research question set', 'Define experiment success metrics'];
    case 'product':
      return ['Write one-page product brief', 'Schedule user feedback session'];
    case 'creative':
      return ['Assemble moodboard and references', 'Draft first creative concept'];
    case 'engineering':
      return ['Create technical design doc', 'Break down implementation tasks'];
    case 'operations':
      return ['Map current operational workflow', 'Propose process improvements'];
    case 'learning':
      return ['Build 2-week learning plan', 'Define practical milestone project'];
    case 'uncertain':
      return ['Collect more context fragments', 'Re-run analysis with richer signals'];
  }
}

export function synthesizeProjects(ideas: DetectedIdea[]): SynthesizedProject[] {
  return ideas.map((idea) => {
    const baseConfidence = Math.min(1, 0.4 + idea.fragmentIds.length * 0.15);
    const confidence = toFixedNumber(baseConfidence * STRENGTH_MULTIPLIER[idea.strength]);

    return {
      id: `project-${idea.category}`,
      name: `${idea.title} sprint`,
      description: `A focused initiative to develop the detected ${idea.category} direction into a testable outcome.`,
      category: idea.category,
      supportingIdeaIds: [idea.id],
      supportingFragmentIds: idea.fragmentIds,
      nextActions: nextActionsForCategory(idea.category),
      confidence,
    };
  });
}
