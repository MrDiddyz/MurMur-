export interface RuntimeConfig {
  nodeEnv: string;
  port: number;
  apiBaseUrl: string;
  integrations: {
    supabaseUrl: string;
    spotifyClientId: string;
    tiktokAccessToken: string;
  };
}

export function loadRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return {
    nodeEnv: env.NODE_ENV ?? "development",
    port: Number(env.PORT ?? 4000),
    apiBaseUrl: env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
    integrations: {
      supabaseUrl: env.SUPABASE_URL ?? "placeholder",
      spotifyClientId: env.SPOTIFY_CLIENT_ID ?? "placeholder",
      tiktokAccessToken: env.TIKTOK_ACCESS_TOKEN ?? "placeholder"
    }
  };
}
