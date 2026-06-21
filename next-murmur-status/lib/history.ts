export type ArtworkRecord = {
  id: string;
  prompt: string;
  imageUrl: string;
  label: string;
  styles: string[];
  createdAt: string;
};

const HISTORY_STORAGE_KEY = "murmur.art.history";

const isBrowser = () => typeof window !== "undefined";

export function readArtworkHistory(): ArtworkRecord[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isArtworkRecord);
  } catch {
    return [];
  }
}

export function saveArtworkHistory(items: ArtworkRecord[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
}

export function appendArtworkToHistory(artwork: ArtworkRecord): ArtworkRecord[] {
  const current = readArtworkHistory();
  const deduped = current.filter((item) => item.id !== artwork.id);
  const next = [artwork, ...deduped].slice(0, 24);

  saveArtworkHistory(next);

  return next;
}

export function getArtworkById(id: string): ArtworkRecord | null {
  const current = readArtworkHistory();
  return current.find((item) => item.id === id) ?? null;
}

function isArtworkRecord(value: unknown): value is ArtworkRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ArtworkRecord>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.prompt === "string" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.label === "string" &&
    Array.isArray(candidate.styles) &&
    candidate.styles.every((style) => typeof style === "string")
  );
}
