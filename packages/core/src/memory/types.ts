export type MemoryProfile = {
  userId: string;
  createdAt: string;
  preferences: Record<string, unknown>;
};

export type MemoryEntryMood = "happy" | "calm" | "focused" | "tired" | "stressed" | "sad" | "energized";

export type MemoryEntry = {
  id: string;
  userId: string;
  createdAt: string;
  text: string;
  tags: string[];
  mood?: MemoryEntryMood | (string & {});
};

export type CreateProfileInput = {
  userId: string;
  preferences?: Record<string, unknown>;
};

export type UpdatePreferencesInput = {
  userId: string;
  preferences: Record<string, unknown>;
};

export type CreateEntryInput = {
  userId: string;
  text: string;
  tags?: string[];
  mood?: MemoryEntry["mood"];
};

export type ListEntriesInput = {
  userId: string;
  limit?: number;
};
