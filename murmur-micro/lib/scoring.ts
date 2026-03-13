const hasAny = (text: string, patterns: RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(text));

export function scoreText(text: string): number {
  const normalized = text.toLowerCase();
  let score = 0;

  if (normalized.length >= 120) {
    score += 2;
  }

  if (hasAny(normalized, [/\bfirst\b/, /\bthen\b/, /\bfinally\b/, /\n- /, /\n\d+\./])) {
    score += 2;
  }

  if (hasAny(normalized, [/for example/, /example/, /e\.g\./, /sample/, /template/])) {
    score += 1.5;
  }

  if (hasAny(normalized, [/risk/, /tradeoff/, /downside/, /constraint/, /limitation/])) {
    score += 2;
  }

  if (hasAny(normalized, [/implement/, /execute/, /next step/, /action/, /checklist/])) {
    score += 2.5;
  }

  if (hasAny(normalized, [/specific/, /metric/, /timeline/, /owner/, /cost/])) {
    score += 2;
  }

  return Number(score.toFixed(2));
}
