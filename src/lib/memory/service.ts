import { InMemoryMemoryRepository, type CreateEntryInput, type MemoryEntry, type MemoryProfile, type MemoryRepository } from "../../../packages/core/src/memory";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

let inMemoryRepository: InMemoryMemoryRepository | null = null;

function getInMemoryRepository(): InMemoryMemoryRepository {
  if (!inMemoryRepository) {
    inMemoryRepository = new InMemoryMemoryRepository();
  }

  return inMemoryRepository;
}

type DbProfile = {
  user_id: string;
  created_at: string;
  preferences: Record<string, unknown>;
};

type DbEntry = {
  id: string;
  user_id: string;
  created_at: string;
  text: string;
  tags: unknown;
  mood: string | null;
};

class SupabaseRestMemoryRepository implements MemoryRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly serviceRoleKey: string
  ) {}

  async createProfile(input: { userId: string; preferences?: Record<string, unknown> }): Promise<MemoryProfile> {
    await this.request<DbProfile[]>("/profiles?on_conflict=user_id", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify([
        {
          user_id: input.userId,
          preferences: input.preferences ?? {}
        }
      ])
    });

    const profile = await this.getProfile(input.userId);
    if (!profile) {
      throw new Error(`Unable to fetch profile after create for user ${input.userId}`);
    }

    return profile;
  }

  async getProfile(userId: string): Promise<MemoryProfile | null> {
    const rows = await this.request<DbProfile[]>(
      `/profiles?user_id=eq.${encodeURIComponent(userId)}&select=user_id,created_at,preferences&limit=1`
    );

    return rows.length > 0 ? mapProfile(rows[0]) : null;
  }

  async updatePreferences(input: { userId: string; preferences: Record<string, unknown> }): Promise<MemoryProfile> {
    await this.request<DbProfile[]>(`/profiles?user_id=eq.${encodeURIComponent(input.userId)}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify({ preferences: input.preferences })
    });

    const profile = await this.getProfile(input.userId);
    if (!profile) {
      throw new Error(`Profile not found for userId=${input.userId}`);
    }

    return profile;
  }

  async createEntry(input: CreateEntryInput): Promise<MemoryEntry> {
    const rows = await this.request<DbEntry[]>("/entries?select=id,user_id,created_at,text,tags,mood", {
      method: "POST",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify([
        {
          user_id: input.userId,
          text: input.text,
          tags: input.tags ?? [],
          mood: input.mood ?? null
        }
      ])
    });

    if (rows.length === 0) {
      throw new Error("Failed to create entry: no row returned");
    }

    return mapEntry(rows[0]);
  }

  async listEntries(input: { userId: string; limit?: number }): Promise<MemoryEntry[]> {
    const limit = input.limit && input.limit > 0 ? `&limit=${input.limit}` : "";

    const rows = await this.request<DbEntry[]>(
      `/entries?user_id=eq.${encodeURIComponent(input.userId)}&select=id,user_id,created_at,text,tags,mood&order=created_at.desc${limit}`
    );

    return rows.map(mapEntry);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}/rest/v1${path}`, {
      method: init?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: this.serviceRoleKey,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        ...(init?.headers ?? {})
      },
      body: init?.body,
      cache: "no-store"
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase REST request failed (${response.status}): ${message}`);
    }

    return (await response.json()) as T;
  }
}

function mapProfile(profile: DbProfile): MemoryProfile {
  return {
    userId: profile.user_id,
    createdAt: profile.created_at,
    preferences: profile.preferences ?? {}
  };
}

function mapEntry(entry: DbEntry): MemoryEntry {
  const tags = Array.isArray(entry.tags) ? entry.tags.filter((tag): tag is string => typeof tag === "string") : [];

  return {
    id: entry.id,
    userId: entry.user_id,
    createdAt: entry.created_at,
    text: entry.text,
    tags,
    mood: entry.mood ?? undefined
  };
}

function createSupabaseRepository(): MemoryRepository | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return new SupabaseRestMemoryRepository(url, serviceRoleKey);
}

function getRepository(): { repository: MemoryRepository; source: "supabase" | "in-memory" } {
  const supabaseRepository = createSupabaseRepository();
  if (supabaseRepository) {
    return { repository: supabaseRepository, source: "supabase" };
  }

  return { repository: getInMemoryRepository(), source: "in-memory" };
}

export function getMemoryUserId(): string {
  return process.env.MEMORY_USER_ID ?? DEFAULT_USER_ID;
}

export async function ensureProfile(userId: string): Promise<MemoryProfile> {
  const { repository } = getRepository();
  const existing = await repository.getProfile(userId);
  if (existing) {
    return existing;
  }

  return repository.createProfile({ userId, preferences: {} });
}

export async function listEntriesForUser(userId: string): Promise<{ entries: MemoryEntry[]; source: "supabase" | "in-memory" }> {
  const { repository, source } = getRepository();
  await ensureProfile(userId);
  const entries = await repository.listEntries({ userId, limit: 50 });
  return { entries, source };
}

export async function createEntryForUser(input: Omit<CreateEntryInput, "userId"> & { userId?: string }): Promise<MemoryEntry> {
  const userId = input.userId ?? getMemoryUserId();
  const { repository } = getRepository();
  await ensureProfile(userId);
  return repository.createEntry({
    userId,
    text: input.text.trim(),
    tags: normalizeTags(input.tags),
    mood: input.mood?.trim() || undefined
  });
}

function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags) {
    return [];
  }

  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}
