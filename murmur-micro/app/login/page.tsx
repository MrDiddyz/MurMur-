"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMagicLink = async () => {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const payload = await response.json();
    setMessage(payload.error ?? "Magic link sent. Check your inbox.");
    setLoading(false);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold">Log in to MurMur</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
      />
      <button
        onClick={sendMagicLink}
        disabled={loading || !email}
        className="rounded-xl bg-indigo-500 px-4 py-3 font-semibold disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send magic link"}
      </button>
      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </main>
  );
}
