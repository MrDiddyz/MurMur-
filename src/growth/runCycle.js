import { supabase } from "../db/supabase.js";
import { decideAction } from "./decisionMaker.js";
import { executeGrowthAction } from "./actions.js";
import { config } from "../config.js";

async function getLastHourCounts() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(start.getHours() - 1);

  const { data, error } = await supabase
    .from("events")
    .select("user_id_hash")
    .eq("event_type", "message_create")
    .gte("created_at", start.toISOString())
    .lt("created_at", now.toISOString());

  if (error) throw error;

  return { messages: data.length, activeUsers: new Set(data.map((d) => d.user_id_hash)).size };
}

async function getLast24hCounts() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(start.getHours() - 24);

  const { data: msgs, error: msgErr } = await supabase
    .from("events")
    .select("user_id_hash")
    .eq("event_type", "message_create")
    .gte("created_at", start.toISOString())
    .lt("created_at", now.toISOString());

  if (msgErr) throw msgErr;

  const { data: joins, error: joinErr } = await supabase
    .from("events")
    .select("id")
    .eq("event_type", "member_join")
    .gte("created_at", start.toISOString())
    .lt("created_at", now.toISOString());

  if (joinErr) throw joinErr;

  return {
    messages: msgs.length,
    activeUsers: new Set(msgs.map((d) => d.user_id_hash)).size,
    newMembers: joins.length
  };
}

async function getLastGrowthPostAt() {
  const { data, error } = await supabase
    .from("actions")
    .select("created_at")
    .eq("action_type", "growth_posted")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0]?.created_at || null;
}

export async function runGrowthCycle(client) {
  const now = new Date();
  const guild = config.guildId
    ? client.guilds.cache.get(config.guildId) || (await client.guilds.fetch(config.guildId).catch(() => null))
    : client.guilds.cache.first();

  if (!guild) {
    console.log("No guild found for growth cycle.", { configuredGuildId: config.guildId });
    return;
  }

  const [lastHour, last24h, lastActionAt] = await Promise.all([
    getLastHourCounts(),
    getLast24hCounts(),
    getLastGrowthPostAt()
  ]);

  const decision = decideAction({ lastHour, last24h, lastActionAt, now });

  console.log("🧠 Growth decision:", { lastHour, last24h, lastActionAt, decision });

  await executeGrowthAction({ client, guild, action: decision });
}
