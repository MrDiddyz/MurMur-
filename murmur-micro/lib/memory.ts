import type { AgentName } from "@/lib/agents";
import { serverSupabase } from "@/lib/supabase";

export type AgentStat = {
  agent: AgentName;
  wins: number;
  weight: number;
};

const defaultStats: AgentStat[] = [
  { agent: "TeacherAgent", wins: 0, weight: 1 },
  { agent: "ExperimentalAgent", wins: 0, weight: 1 },
  { agent: "ThinkTankAgent", wins: 0, weight: 1 },
  { agent: "ReflectiveAgent", wins: 0, weight: 1 }
];

export async function getAgentStats(): Promise<AgentStat[]> {
  const { data, error } = await serverSupabase.from("agent_stats").select("agent,wins,weight");

  if (error || !data) {
    return defaultStats;
  }

  return data as AgentStat[];
}

export async function applyWin(winner: AgentName) {
  await serverSupabase.rpc("increment_agent_win", { agent_name: winner });
}
