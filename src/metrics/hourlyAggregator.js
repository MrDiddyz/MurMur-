import cron from "node-cron";
import { supabase } from "../db/supabase.js";

export function startHourlyAggregator() {
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const windowEnd = new Date(now);
      const windowStart = new Date(now);
      windowStart.setHours(windowStart.getHours() - 1);

      console.log("⏱ Running hourly aggregation:", windowStart, "→", windowEnd);

      const { data: messageEvents, error: msgErr } = await supabase
        .from("events")
        .select("user_id_hash")
        .eq("event_type", "message_create")
        .gte("created_at", windowStart.toISOString())
        .lt("created_at", windowEnd.toISOString());

      if (msgErr) throw msgErr;

      const messages = messageEvents.length;
      const uniqueUsers = new Set(messageEvents.map((e) => e.user_id_hash)).size;

      const { data: joinEvents, error: joinErr } = await supabase
        .from("events")
        .select("id")
        .eq("event_type", "member_join")
        .gte("created_at", windowStart.toISOString())
        .lt("created_at", windowEnd.toISOString());

      if (joinErr) throw joinErr;

      const newMembers = joinEvents.length;

      const { error: insertErr } = await supabase
        .from("metrics_hourly")
        .insert([
          {
            window_start: windowStart.toISOString(),
            window_end: windowEnd.toISOString(),
            messages,
            active_users: uniqueUsers,
            new_members: newMembers
          }
        ]);

      if (insertErr) throw insertErr;

      console.log("✅ Hourly metrics stored:", { messages, uniqueUsers, newMembers });
    } catch (err) {
      console.error("❌ Hourly aggregator error:", err);
    }
  });
}
