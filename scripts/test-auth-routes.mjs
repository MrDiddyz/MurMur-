import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const PORT = 3010;
const BASE = `http://127.0.0.1:${PORT}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(timeoutMs = 60000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${BASE}/settings`, { redirect: 'manual' });
      if (response.status >= 200) return;
    } catch {
      // Keep polling.
    }
    await wait(800);
  }
  throw new Error('Timed out waiting for Next.js dev server');
}

async function postJson(path, body) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const dev = spawn('npm', ['run', 'dev', '--', '--port', String(PORT)], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
});

dev.stdout.on('data', (chunk) => process.stdout.write(chunk));
dev.stderr.on('data', (chunk) => process.stderr.write(chunk));

try {
  await waitForServer();

  // Route validation checks should work regardless of Supabase env presence.
  {
    const response = await postJson('/api/auth/sign-in', { email: '', password: '' });
    assert.equal(response.status, 400, 'sign-in should validate required fields');
  }

  {
    const response = await postJson('/api/auth/sign-up', { email: 'user@example.com', password: 'short' });
    assert.equal(response.status, 400, 'sign-up should validate password length');
  }

  {
    const response = await postJson('/api/auth/magic-link', { email: 'not-an-email' });
    assert.equal(response.status, 400, 'magic-link should validate email format');
  }

  {
    const response = await postJson('/api/auth/sign-out', {});
    assert.equal(response.status, 200, 'sign-out should succeed without session');
    const setCookie = response.headers.get('set-cookie') ?? '';
    assert.match(setCookie, /sb-access-token=/, 'sign-out should clear access token cookie');
    assert.match(setCookie, /sb-refresh-token=/, 'sign-out should clear refresh token cookie');
    assert.match(setCookie.toLowerCase(), /max-age=0/, 'sign-out should expire cookies');
  }

  {
    const response = await fetch(`${BASE}/api/auth/session`);
    assert.equal(response.status, 200, 'session endpoint should be reachable');
    assert.equal(response.headers.get('cache-control'), 'no-store', 'session endpoint should disable caching');
  }

  {
    const response = await fetch(`${BASE}/api/auth/callback`, { redirect: 'manual' });
    assert.equal(response.status, 307, 'callback GET without tokens should redirect');
    const location = response.headers.get('location') ?? '';
    assert.match(location, /\/settings\?authError=missing_callback_tokens$/, 'callback should include explicit missing-token error');
  }

  {
    const response = await postJson('/api/auth/callback', { foo: 'bar' });
    assert.equal(response.status, 400, 'callback POST without session payload should fail validation');
  }

  // Optional live Supabase checks if env variables are present.
  const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (hasSupabaseEnv) {
    const testEmail = `codex+${Date.now()}@example.com`;
    const password = 'Supabase123!';

    const signUpResponse = await postJson('/api/auth/sign-up', { email: testEmail, password });
    assert.ok([200, 400].includes(signUpResponse.status), `unexpected sign-up status: ${signUpResponse.status}`);

    const signInResponse = await postJson('/api/auth/sign-in', { email: testEmail, password });
    assert.ok([200, 401].includes(signInResponse.status), `unexpected sign-in status: ${signInResponse.status}`);

    console.log('Live Supabase checks were attempted (magic-link/google still require interactive external roundtrip).');
  } else {
    console.log('Live Supabase checks skipped: missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  console.log('Auth route checks passed.');
} finally {
  dev.kill('SIGINT');
}
