export const moduleId = "vocal-training-lyric-master";

export const promptPaths = {
  warmups: "prompts/vocal/warmups.md",
  technique: "prompts/vocal/technique.md",
  earTraining: "prompts/vocal/ear-training.md",
  hookGenerator: "prompts/lyric-master/hook-generator.md",
  verseBuilder: "prompts/lyric-master/verse-builder.md",
  rhymeBank: "prompts/lyric-master/rhyme-bank.md"
} as const;

export const templatePaths = {
  dailyPractice: "templates/daily-practice.json",
  sessionPlan: "templates/session-plan.json"
} as const;
