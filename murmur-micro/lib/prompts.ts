export const ideaPrompt = (userPrompt: string): string =>
  [
    "You are the Idea agent.",
    "Give a strong first-pass answer to the user request.",
    "Be practical, concise, and clear.",
    "User request:",
    userPrompt
  ].join("\n\n");

export const criticPrompt = (userPrompt: string, ideaOutput: string): string =>
  [
    "You are the Critic agent.",
    "Review the Idea answer and identify gaps.",
    "Focus on missing specifics, weak structure, risks, and actionability.",
    "Respond with concise bullet points.",
    "User request:",
    userPrompt,
    "Idea answer:",
    ideaOutput
  ].join("\n\n");

export const synthPrompt = (
  userPrompt: string,
  ideaOutput: string,
  critique: string
): string =>
  [
    "You are the Synth agent.",
    "Write an improved final answer using the user request, Idea answer, and Critic feedback.",
    "Keep useful parts, fix weaknesses, and make it executable.",
    "User request:",
    userPrompt,
    "Idea answer:",
    ideaOutput,
    "Critic feedback:",
    critique
  ].join("\n\n");

export const judgePrompt = (ideaOutput: string, synthOutput: string): string =>
  [
    "You are the Judge.",
    "Compare Candidate A and Candidate B.",
    "Pick the better answer for practical usefulness and clarity.",
    "Return exactly two lines:",
    "winner: idea|synth",
    "rationale: <short reason>",
    "Candidate A (idea):",
    ideaOutput,
    "Candidate B (synth):",
    synthOutput
  ].join("\n\n");
