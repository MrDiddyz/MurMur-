import { createClient } from "@/lib/db/supabase";
import { ArchiveCreateSchema } from "@/lib/validation/archive";

export async function createArchiveItem(input: unknown) {
  const parsed = ArchiveCreateSchema.parse(input);
  const supabase = createClient();
  const { data, error } = await supabase.from("archive_items").insert(parsed).select("*").single();
  if (error) throw error;
  return data;
}
