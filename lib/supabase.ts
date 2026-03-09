import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export const supabaseBrowser = createClient(env.supabaseUrl, env.supabaseAnonKey);

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
