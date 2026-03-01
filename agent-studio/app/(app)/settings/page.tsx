import SettingsForm from "@/components/SettingsForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkspaceId } from "@/lib/workspace";

export default async function SettingsPage() {
  const workspaceId = await getMyWorkspaceId();
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("agent_settings")
    .select("temperature, reward_weight, risk_weight")
    .eq("workspace_id", workspaceId)
    .single();

  const settings = data ?? {
    temperature: 0.2,
    reward_weight: 1,
    risk_weight: 1,
  };

  return <SettingsForm settings={settings} />;
}
