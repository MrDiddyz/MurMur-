export type CreatorStudioDraft = {
  pinataJwt: string;
  contractAddress: string;
  name: string;
  artist: string;
  description: string;
  collection: string;
  mood: string;
  style: string;
  externalUrl: string;
  royaltyFee: number;
  imageUri: string;
  metadataUri: string;
};

export const CREATOR_STUDIO_DRAFT_KEY = "murmur_creator_studio_draft";

export const defaultDraft: CreatorStudioDraft = {
  pinataJwt: "",
  contractAddress: "",
  name: "",
  artist: "MurMur",
  description: "",
  collection: "",
  mood: "",
  style: "",
  externalUrl: "",
  royaltyFee: 750,
  imageUri: "",
  metadataUri: "",
};

function createDefaultDraft(): CreatorStudioDraft {
  return { ...defaultDraft };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringOrDefault(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function toRoyaltyFeeOrDefault(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.round(value));
}

function sanitizeDraft(value: unknown): CreatorStudioDraft {
  const base = createDefaultDraft();

  if (!isRecord(value)) {
    return base;
  }

  return {
    pinataJwt: toStringOrDefault(value.pinataJwt, base.pinataJwt),
    contractAddress: toStringOrDefault(value.contractAddress, base.contractAddress),
    name: toStringOrDefault(value.name, base.name),
    artist: toStringOrDefault(value.artist, base.artist),
    description: toStringOrDefault(value.description, base.description),
    collection: toStringOrDefault(value.collection, base.collection),
    mood: toStringOrDefault(value.mood, base.mood),
    style: toStringOrDefault(value.style, base.style),
    externalUrl: toStringOrDefault(value.externalUrl, base.externalUrl),
    royaltyFee: toRoyaltyFeeOrDefault(value.royaltyFee, base.royaltyFee),
    imageUri: toStringOrDefault(value.imageUri, base.imageUri),
    metadataUri: toStringOrDefault(value.metadataUri, base.metadataUri),
  };
}

export function loadDraft(): CreatorStudioDraft {
  if (typeof window === "undefined") {
    return createDefaultDraft();
  }

  const raw = window.localStorage.getItem(CREATOR_STUDIO_DRAFT_KEY);

  if (!raw) {
    return createDefaultDraft();
  }

  try {
    return sanitizeDraft(JSON.parse(raw));
  } catch {
    return createDefaultDraft();
  }
}

export function saveDraft(draft: CreatorStudioDraft): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    CREATOR_STUDIO_DRAFT_KEY,
    JSON.stringify(sanitizeDraft(draft))
  );
}

export function clearDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CREATOR_STUDIO_DRAFT_KEY);
}
