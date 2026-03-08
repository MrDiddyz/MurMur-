interface ApiEnv {
  port: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
}

function getRequired(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getApiEnv(env: NodeJS.ProcessEnv = process.env): ApiEnv {
  const port = Number(env.PORT ?? 3001);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error("PORT must be a positive number");
  }

  return {
    port,
    supabaseUrl: getRequired("SUPABASE_URL", env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: getRequired(
      "SUPABASE_ANON_KEY",
      env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    supabaseServiceRoleKey: getRequired("SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY)
  };
}
