import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getMyWorkspaceId() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) throw new Error("No workspace membership found");

  return data.workspace_id as string;
}
