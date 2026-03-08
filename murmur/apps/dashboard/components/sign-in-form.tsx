"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDashboardBrowserSupabaseClient } from "../lib/supabase";

export function SignInForm() {
  const router = useRouter();
  const supabase = createDashboardBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="card"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          setError(signInError.message);
          setIsSubmitting(false);
          return;
        }

        router.push("/campaigns");
        router.refresh();
      }}
    >
      <h1>Sign in</h1>
      <input
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isSubmitting}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={isSubmitting}
      />
      <br />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      {error ? <p>{error}</p> : null}
    </form>
  );
}
