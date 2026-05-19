export type SignalAnalysis = {
  summary: string;
  wordCount: number;
};

export function analyzeSignal(signal: string): SignalAnalysis {
  const normalized = signal.trim();
  const words = normalized ? normalized.split(/\s+/).length : 0;

  return {
    summary: normalized
      ? `Captured ${words} words for council review.`
      : 'No signal content was provided.',
    wordCount: words,
  };
}
