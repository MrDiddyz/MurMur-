import { normalize } from "./text.js";

export function countAnchorWords(text: string, anchors: string[]): number {
  const normalized = normalize(text);
  return anchors.reduce((sum, word) => {
    return sum + (normalized.includes(normalize(word)) ? 1 : 0);
  }, 0);
}

export function hasRepetition(text: string): boolean {
  const words = normalize(text).split(/\s+/).filter(Boolean);
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  for (const [word, count] of counts) {
    if (word.length > 3 && count >= 2) return true;
  }

  return false;
}
