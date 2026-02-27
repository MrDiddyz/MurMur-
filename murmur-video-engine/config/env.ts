export const ENV = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  SUPABASE_URL: process.env.SUPABASE_URL ?? "",
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE ?? "",
  ELEVENLABS_KEY: process.env.ELEVENLABS_KEY ?? "",
};

export function assertEnv() {
  const required = [
    "OPENAI_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE",
    "ELEVENLABS_KEY",
  ] as const;

  for (const key of required) {
    if (!ENV[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
