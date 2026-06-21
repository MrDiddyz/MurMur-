import type { ScanEntry } from "@/types";

const STORAGE_KEY = "murmur-security-history";

const isScanEntry = (value: unknown): value is ScanEntry => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ScanEntry>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.text === "string" &&
    typeof candidate.createdAt === "string" &&
    !!candidate.result &&
    typeof candidate.result.score === "number" &&
    ["LOW", "MEDIUM", "HIGH"].includes(candidate.result.risk) &&
    Array.isArray(candidate.result.triggers) &&
    typeof candidate.result.reasoning === "string" &&
    typeof candidate.result.recommendation === "string"
  );
};

const canUseStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage;

export const getScanHistory = (): ScanEntry[] => {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isScanEntry).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } catch {
    return [];
  }
};

const writeHistory = (entries: ScanEntry[]): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // fail silently for storage limits/quota
  }
};

export const saveScanEntry = (entry: ScanEntry): void => {
  const entries = getScanHistory();
  writeHistory([entry, ...entries]);
};

export const deleteScanEntry = (id: string): void => {
  const entries = getScanHistory().filter((entry) => entry.id !== id);
  writeHistory(entries);
};

export const clearScanHistory = (): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail silently
  }
};
