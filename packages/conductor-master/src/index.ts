export const moduleId = "conductor-master";

export const promptPaths = {
  rehearsalPlan: "prompts/rehearsal-plan.md",
  gestureLanguage: "prompts/gesture-language.md",
  scoreAnalysis: "prompts/score-analysis.md"
} as const;

export const templatePaths = {
  rehearsalBlocks: "templates/rehearsal-blocks.json",
  conductorNotes: "templates/conductor-notes.json"
} as const;
