export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function summarizeObject(input: unknown): string {
  if (input === null) return "null";
  if (typeof input !== "object") return String(input);
  const keys = Object.keys(input as Record<string, unknown>);
  return keys.length > 0 ? `keys: ${keys.join(", ")}` : "empty object";
}
