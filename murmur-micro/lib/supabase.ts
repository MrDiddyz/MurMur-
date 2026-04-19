import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const anonSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

export const serverSupabase = createClient(supabaseUrl, serviceRoleKey ?? supabaseAnonKey, {
  auth: { persistSession: false }
});

export const getSupabaseAdmin = () => serverSupabase;

export const getUserFromToken = async (accessToken: string) => {
  const { data, error } = await anonSupabase.auth.getUser(accessToken);
  if (error) {
    return null;
  }
  return data.user;
};
