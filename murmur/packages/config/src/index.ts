import { createBrowserClient, createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export interface SupabaseEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
}

export function getSupabaseEnv(env: NodeJS.ProcessEnv = process.env): SupabaseEnv {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and anon key are required.");
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
  };
}

export function createSupabaseBrowserClient(env: SupabaseEnv = getSupabaseEnv()) {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

export function createSupabaseServerClient(
  cookies: CookieMethodsServer,
  env: SupabaseEnv = getSupabaseEnv()
) {
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, { cookies });
}

export function createSupabaseAdminClient(env: SupabaseEnv = getSupabaseEnv()) {
  if (!env.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin clients.");
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
