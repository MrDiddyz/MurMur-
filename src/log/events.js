import crypto from "crypto";
import { supabase } from "../db/supabase.js";

export function hashUserId(id) {
  return crypto.createHash("sha256").update(String(id)).digest("hex");
}

export async function logEvent({
  event_type,
  guild_id,
  channel_id,
  user_id_hash,
  payload = {},
  platform = "discord"
}) {
  const { error } = await supabase.from("events").insert([
    { event_type, guild_id, channel_id, user_id_hash, payload, platform }
  ]);
  if (error) console.error("Supabase logEvent error:", error.message);
}

export async function logAction({
  action_type,
  guild_id,
  channel_id,
  correlation_id,
  input = {},
  output = {},
  platform = "discord"
}) {
  const { error } = await supabase.from("actions").insert([
    { action_type, guild_id, channel_id, correlation_id, input, output, platform }
  ]);
  if (error) console.error("Supabase logAction error:", error.message);
}
