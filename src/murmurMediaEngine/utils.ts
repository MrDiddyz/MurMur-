import { randomUUID } from "node:crypto";

export const nowIso = () => new Date().toISOString();

export const makeId = (prefix: string) => `${prefix}_${randomUUID()}`;

export const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);

export const topN = (counts: Record<string, number>, n = 5): string[] =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
