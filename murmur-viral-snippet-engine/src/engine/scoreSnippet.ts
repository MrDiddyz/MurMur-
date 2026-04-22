import { STRONG_HOOK_WORDS } from "../config.js";
import { LyricLine } from "../types.js";
import { countAnchorWords, hasRepetition } from "../utils/anchors.js";

export function scoreSnippet(lines: LyricLine[], anchors: string[]): { score: number; reasons: string[] } {
  const joined = lines.map(l => l.text).join(" ");
  const cues = lines.map(l => l.cue).join(" ");
  let score = 48;
  const reasons: string[] = [];

  const anchorCount = countAnchorWords(joined, anchors);
  score += Math.min(anchorCount * 7, 28);
  if (anchorCount > 0) reasons.push(`anchor_words:${anchorCount}`);

  if (hasRepetition(joined)) {
    score += 10;
    reasons.push("repetition");
  }

  if (/whisper|close-mic|airy/i.test(cues) && /kick|808|drop|pulse/i.test(cues)) {
    score += 12;
    reasons.push("whisper_to_drop");
  }

  const strongWordHits = STRONG_HOOK_WORDS.filter(word => joined.toLowerCase().includes(word)).length;
  if (strongWordHits > 0) {
    score += Math.min(strongWordHits * 4, 16);
    reasons.push(`strong_hook_words:${strongWordHits}`);
  }

  if (/still i miss|heart|love|kiss/i.test(joined)) {
    score += 8;
    reasons.push("emotional_pull");
  }

  if (joined.length < 140) {
    score += 6;
    reasons.push("short_memorable");
  }

  return { score: Math.min(score, 100), reasons };
}
