'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';

export function AuditForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch('/api/audits/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? 'Unable to generate audit.');
      return;
    }

    router.push(`/audits/${data.id}`);
    router.refresh();
  }

  return (
    <Card className="p-8">
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="businessName">Business name</Label><Input id="businessName" name="businessName" required placeholder="Aurelia Dental Studio" /></div>
          <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" name="website" required placeholder="https://example.com" /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="industry">Industry</Label><Input id="industry" name="industry" required placeholder="Local med spa, restaurant, law firm…" /></div>
        <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" placeholder="Known concerns, target customers, market, competitors, current campaigns…" /></div>
        {error && <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}
        <Button disabled={loading} className="w-full md:w-auto">{loading ? 'Generating premium audit…' : 'Generate Signal Audit'}</Button>
      </form>
    </Card>
  );
}
