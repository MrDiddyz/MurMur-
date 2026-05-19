import { createServerSupabaseClient } from '@/lib/supabase/server';

export type ReflectionInput = {
  body: string;
  source?: string;
};

export async function saveReflection(input: ReflectionInput) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('reflections')
    .insert({ body: input.body, source: input.source ?? 'app' })
    .select('id, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
