'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function parseHash(hash: string) {
  const search = new URLSearchParams(hash.replace(/^#/, ''));
  const expiresIn = Number(search.get('expires_in') ?? '3600');
  return {
    access_token: search.get('access_token') ?? undefined,
    refresh_token: search.get('refresh_token') ?? undefined,
    expires_in: Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3600,
  };
}

function parseSearch(search: string) {
  const params = new URLSearchParams(search);
  const expiresIn = Number(params.get('expires_in') ?? '3600');

  return {
    access_token: params.get('access_token') ?? undefined,
    refresh_token: params.get('refresh_token') ?? undefined,
    token_hash: params.get('token_hash') ?? undefined,
    type: params.get('type') ?? undefined,
    expires_in: Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3600,
  };
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Finishing sign-in...');

  useEffect(() => {
    async function run() {
      const hashPayload = parseHash(window.location.hash);
      const queryPayload = parseSearch(window.location.search);

      const payload = hashPayload.access_token
        ? hashPayload
        : queryPayload.access_token || queryPayload.token_hash
          ? queryPayload
          : null;

      if (!payload) {
        setMessage('No session found in callback URL. Try signing in again.');
        return;
      }

      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setMessage('Unable to store auth session.');
        return;
      }

      router.replace('/settings');
      router.refresh();
    }

    void run();
  }, [router]);

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <p className="text-sm text-slate-600">{message}</p>
    </main>
  );
}
