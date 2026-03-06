import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { signInWithPassword } from "../../lib/supabase"

async function signIn(formData: FormData) {
  "use server"

  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    redirect("/login?error=missing_credentials")
  }

  try {
    const session = await signInWithPassword(email, password)
    cookies().set("sb-access-token", session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: session.expires_in,
    })
    redirect("/dashboard")
  } catch {
    redirect("/login?error=invalid_credentials")
  }
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "48px auto", padding: 24 }}>
      <h1>MurMur Stronghold Login</h1>
      <p>Secure sign-in backed by Supabase Auth.</p>
      {searchParams?.error ? (
        <p style={{ color: "#b91c1c" }}>Login failed. Check your credentials and try again.</p>
      ) : null}

      <form action={signIn} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input name="email" type="email" required style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </label>
        <label>
          Password
          <input name="password" type="password" required style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </label>
        <button type="submit" style={{ padding: "10px 14px" }}>
          Login
        </button>
      </form>
    </main>
  )
}
