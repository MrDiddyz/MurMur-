'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthControls() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  async function submit(path: string, body: Record<string, string>) {
    setStatus('Working...');
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus(data.error ?? 'Request failed.');
      return;
    }

    setStatus('Success.');
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Sign in or create account</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Password
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => submit('/api/auth/sign-in', { email, password })}
          type="button"
        >
          Email + password sign in
        </button>
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
          onClick={() => submit('/api/auth/sign-up', { email, password })}
          type="button"
        >
          Sign up
        </button>
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
          onClick={() => submit('/api/auth/magic-link', { email })}
          type="button"
        >
          Send magic link
        </button>
        <a
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
          href="/api/auth/google"
        >
          Continue with Google (optional)
        </a>
        <button
          className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700"
          onClick={() => submit('/api/auth/sign-out', {})}
          type="button"
        >
          Sign out
        </button>
      </div>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </div>
  );
}
