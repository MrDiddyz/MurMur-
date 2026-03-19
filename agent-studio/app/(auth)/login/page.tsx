import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect("/dashboard");

  async function sendMagicLink(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "").trim();
    if (!email) return;

    const supabase = createServerSupabaseClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    redirect("/login?sent=1");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="mb-2 text-2xl font-semibold">Agent Studio</h1>
        <p className="mb-6 text-sm text-zinc-400">Logg inn med magic link.</p>
        <form action={sendMagicLink} className="space-y-4">
          <input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
          <button className="w-full rounded-md bg-sky-500 px-4 py-2 font-medium text-zinc-950 hover:bg-sky-400">
            Send magic link
          </button>
        </form>
      </div>
    </main>
  );
}
