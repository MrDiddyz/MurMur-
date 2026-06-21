'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const supabase = createClient();
    const action = mode === 'signin'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
    const { error } = await action;
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.32em] text-champagne">MurMur</Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.05em]">{mode === 'signin' ? 'Welcome back.' : 'Create access.'}</h1>
        <p className="mt-3 text-sm leading-6 text-smoke">Sign in to save audits, revisit reports, and export premium PDFs.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="founder@example.com" /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
          {message && <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100">{message}</p>}
          <Button className="w-full" disabled={loading}>{loading ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}</Button>
        </form>
        <button className="mt-6 text-sm text-smoke hover:text-champagne" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? 'Need an account? Create one.' : 'Already have an account? Sign in.'}
        </button>
      </Card>
    </main>
  );
}
