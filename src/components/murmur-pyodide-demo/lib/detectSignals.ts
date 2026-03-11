export const normalizeOutputLines = (rawOutput: string): string[] =>
  rawOutput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.toLowerCase());
