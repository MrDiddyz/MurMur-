const REQUIRED_SUPABASE_ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

type RequiredSupabaseEnvName = (typeof REQUIRED_SUPABASE_ENV)[number];

function requireEnv(name: RequiredSupabaseEnvName): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeSupabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL (e.g. https://<project-ref>.supabase.co).');
  }
}

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

let cachedConfig: SupabaseConfig | null = null;

export function getSupabaseConfig(): SupabaseConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const url = normalizeSupabaseUrl(requireEnv('NEXT_PUBLIC_SUPABASE_URL'));

  cachedConfig = {
    url,
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  };

  return cachedConfig;
}
