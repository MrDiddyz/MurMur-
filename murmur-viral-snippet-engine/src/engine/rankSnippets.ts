import { SnippetCandidate } from "../types.js";

function cloneWithLoop(snippet: SnippetCandidate, index: number): SnippetCandidate {
  return {
    ...snippet,
    start_label: `${snippet.start_label}_loop_${index}`,
    end_label: `${snippet.end_label}_loop_${index}`,
    snippet_type: "sad_loop",
    viral_score: Math.max(60, snippet.viral_score - 6),
    reasons: [...snippet.reasons, "loop_variation"]
  };
}

export function rankSnippets(snippets: SnippetCandidate[]): SnippetCandidate[] {
  const ranked = [...snippets].sort((a, b) => {
    if (b.viral_score !== a.viral_score) return b.viral_score - a.viral_score;
    return a.title.localeCompare(b.title);
  });

  const top = ranked.slice(0, 10);
  if (top.length === 0) return top;

  let i = 1;
  while (top.length < 10) {
    top.push(cloneWithLoop(top[(i - 1) % top.length], i));
    i += 1;
  }

  return top;
}
