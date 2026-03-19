import { generateText } from "@/lib/openai";
import { ideaPrompt, criticPrompt, synthPrompt, judgePrompt } from "@/lib/prompts";
import { scoreText } from "@/lib/scoring";
import type { AgentResult, MurmurRunResult } from "@/types/murmur";

function parseJudgeResult(judgeOutput: string): { winner?: "idea" | "synth"; rationale: string } {
  const winnerMatch = judgeOutput.match(/winner:\s*(idea|synth)/i);
  const rationaleMatch = judgeOutput.match(/rationale:\s*(.+)/i);

  return {
    winner: winnerMatch?.[1]?.toLowerCase() as "idea" | "synth" | undefined,
    rationale: rationaleMatch?.[1]?.trim() || "Selected by combined model and heuristic scoring."
  };
}

export async function runMurmur(prompt: string): Promise<MurmurRunResult> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    throw new Error("Prompt cannot be empty");
  }

  const ideaInput = ideaPrompt(cleanPrompt);
  const ideaOutput = await generateText(ideaInput);
  const ideaScore = scoreText(ideaOutput);

  const criticInput = criticPrompt(cleanPrompt, ideaOutput);
  const criticOutput = await generateText(criticInput);

  const synthInput = synthPrompt(cleanPrompt, ideaOutput, criticOutput);
  const synthOutput = await generateText(synthInput);
  const synthScore = scoreText(synthOutput);

  const judgeInput = judgePrompt(ideaOutput, synthOutput);
  const judgeOutput = await generateText(judgeInput);
  const judgeParsed = parseJudgeResult(judgeOutput);

  const heuristicWinner: "idea" | "synth" = synthScore >= ideaScore ? "synth" : "idea";
  const scoreGap = Math.abs(synthScore - ideaScore);

  // Use both judge output and deterministic score. If the score gap is meaningful,
  // trust the heuristic; otherwise prefer the judge's pick when available.
  const judgeProvidedWinner = judgeParsed.winner !== undefined;
  const useHeuristicDueToGap = scoreGap >= 2;
  
  const winner: "idea" | "synth" =
    scoreGap >= 2 ? heuristicWinner : judgeParsed.winner ?? heuristicWinner;

  const score = winner === "idea" ? ideaScore : synthScore;
  const final = winner === "idea" ? ideaOutput : synthOutput;

  let rationale: string;
  if (winner === heuristicWinner && useHeuristicDueToGap) {
    // Heuristic was used because score gap was large
    rationale = `${judgeParsed.rationale} Heuristic score override applied due to larger quality gap.`;
  } else if (winner === heuristicWinner && !judgeProvidedWinner) {
    // Heuristic was used because judge failed to provide a decision
    rationale = `${judgeParsed.rationale} Judge did not provide a clear winner; heuristic score determined the outcome.`;
  } else {
    // Judge provided a winner and score gap was small enough to trust the judge
    rationale = judgeParsed.rationale;
  }

  const trace: AgentResult[] = [
    { agent: "idea", input: ideaInput, output: ideaOutput, score: ideaScore },
    { agent: "critic", input: criticInput, output: criticOutput },
    { agent: "synth", input: synthInput, output: synthOutput, score: synthScore },
    { agent: "judge", input: judgeInput, output: judgeOutput, score }
  ];

  return {
    final,
    winner,
    rationale,
    score,
    trace
  };
}
