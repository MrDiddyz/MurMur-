import {
  CreateEntryInput,
  CreateProfileInput,
  ListEntriesInput,
  MemoryEntry,
  MemoryProfile,
  UpdatePreferencesInput
} from "./types";

export interface MemoryRepository {
  createProfile(input: CreateProfileInput): Promise<MemoryProfile>;
  getProfile(userId: string): Promise<MemoryProfile | null>;
  updatePreferences(input: UpdatePreferencesInput): Promise<MemoryProfile>;
  createEntry(input: CreateEntryInput): Promise<MemoryEntry>;
  listEntries(input: ListEntriesInput): Promise<MemoryEntry[]>;
}

export class InMemoryMemoryRepository implements MemoryRepository {
  private readonly profiles = new Map<string, MemoryProfile>();
  private readonly entries = new Map<string, MemoryEntry[]>();

  async createProfile(input: CreateProfileInput): Promise<MemoryProfile> {
    const existing = this.profiles.get(input.userId);
    if (existing) {
      return existing;
    }

    const profile: MemoryProfile = {
      userId: input.userId,
      createdAt: new Date().toISOString(),
      preferences: input.preferences ?? {}
    };

    this.profiles.set(profile.userId, profile);
    return profile;
  }

  async getProfile(userId: string): Promise<MemoryProfile | null> {
    return this.profiles.get(userId) ?? null;
  }

  async updatePreferences(input: UpdatePreferencesInput): Promise<MemoryProfile> {
    const profile = this.profiles.get(input.userId);
    if (!profile) {
      throw new Error(`Profile not found for userId=${input.userId}`);
    }

    const updated: MemoryProfile = {
      ...profile,
      preferences: input.preferences
    };

    this.profiles.set(input.userId, updated);
    return updated;
  }

  async createEntry(input: CreateEntryInput): Promise<MemoryEntry> {
    const entries = this.entries.get(input.userId) ?? [];
    const next: MemoryEntry = {
      id: crypto.randomUUID(),
      userId: input.userId,
      createdAt: new Date().toISOString(),
      text: input.text,
      tags: normalizeTags(input.tags),
      mood: input.mood
    };

    this.entries.set(input.userId, [next, ...entries]);
    return next;
  }

  async listEntries(input: ListEntriesInput): Promise<MemoryEntry[]> {
    const entries = this.entries.get(input.userId) ?? [];
    if (!input.limit || input.limit < 1) {
      return entries;
    }

    return entries.slice(0, input.limit);
  }
}

function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags) {
    return [];
  }

  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}
