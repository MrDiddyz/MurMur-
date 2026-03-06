const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

type SupabaseSession = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: { id: string; email?: string }
}

function requireConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("missing supabase config")
  }
}

export async function signInWithPassword(email: string, password: string): Promise<SupabaseSession> {
  requireConfig()

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("invalid credentials")
  }

  return response.json()
}

export async function fetchAuthUser(accessToken: string) {
  requireConfig()

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export async function selectTable(accessToken: string, table: string, query: string) {
  requireConfig()

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return []
  }

  return response.json()
}
