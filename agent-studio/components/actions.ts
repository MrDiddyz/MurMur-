"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkspaceId } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runSimulation } from "@/lib/simulation";

export async function createScenario(formData: FormData) {
  const workspaceId = await getMyWorkspaceId();
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const title = String(formData.get("title") || "Untitled");
  const description = String(formData.get("description") || "");
  const complexity = Number(formData.get("complexity") || 1);
  const risk = Number(formData.get("risk") || 1);

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
      title,
      description,
      complexity,
      risk,
    })
    .select("id")
    .single();

  if (error) throw error;

  redirect(`/scenarios/${data.id}`);
}

export async function runScenario(formData: FormData) {
  const workspaceId = await getMyWorkspaceId();
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const scenarioId = String(formData.get("scenario_id"));
  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("id, title, complexity, risk")
    .eq("id", scenarioId)
    .single();

  if (scenarioError || !scenario) throw scenarioError ?? new Error("Scenario not found");

  const { data: settings } = await supabase
    .from("agent_settings")
    .select("temperature, reward_weight, risk_weight")
    .eq("workspace_id", workspaceId)
    .single();

  const effectiveSettings = settings ?? {
    temperature: 0.2,
    reward_weight: 1,
    risk_weight: 1,
  };

  const sim = runSimulation(scenario, effectiveSettings);

  const { error } = await supabase.from("scenario_runs").insert({
    workspace_id: workspaceId,
    scenario_id: scenario.id,
    created_by: user.id,
    score: sim.score,
    proposals: sim.proposals,
    settings_snapshot: effectiveSettings,
  });

  if (error) throw error;

  revalidatePath(`/scenarios/${scenario.id}`);
}

export async function saveBaseline(formData: FormData) {
  const workspaceId = await getMyWorkspaceId();
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const scenarioId = String(formData.get("scenario_id"));
  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("id, title, description, complexity, risk")
    .eq("id", scenarioId)
    .single();

  if (scenarioError || !scenario) throw scenarioError ?? new Error("Scenario not found");

  const snapshot = {
    scenario,
    saved_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("baselines").insert({
    workspace_id: workspaceId,
    scenario_id: scenario.id,
    created_by: user.id,
    snapshot,
  });

  if (error) throw error;

  revalidatePath("/baselines");
  revalidatePath(`/scenarios/${scenario.id}`);
}

export async function updateSettings(formData: FormData) {
  const workspaceId = await getMyWorkspaceId();
  const supabase = createServerSupabaseClient();

  const temperature = Number(formData.get("temperature") || 0.2);
  const reward_weight = Number(formData.get("reward_weight") || 1);
  const risk_weight = Number(formData.get("risk_weight") || 1);

  const { error } = await supabase.from("agent_settings").upsert(
    {
      workspace_id: workspaceId,
      temperature,
      reward_weight,
      risk_weight,
    }
  );

  if (error) throw error;

  revalidatePath("/settings");
}
