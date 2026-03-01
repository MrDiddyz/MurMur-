import "dotenv/config";

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const config = {
  discordToken: must("DISCORD_TOKEN"),
  openaiKey: must("OPENAI_API_KEY"),
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",

  supabaseUrl: must("SUPABASE_URL"),
  supabaseServiceRoleKey: must("SUPABASE_SERVICE_ROLE_KEY"),

  welcomeChannelName: process.env.WELCOME_CHANNEL_NAME || "general",
  maxAiReplyPerUserPerMin: Number(process.env.MAX_AI_REPLY_PER_USER_PER_MIN || "3")
};
