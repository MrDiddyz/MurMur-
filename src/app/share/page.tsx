'use client';

import { useState } from 'react';
import { PageShell } from '@/components/mvp/page-shell';

export default function SharePage() {
  const [copied, setCopied] = useState(false);
  const [shareUrl] = useState('https://murmur.example.com/collect/mmr-101');

  async function copyUrl() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  return (
    <PageShell
      eyebrow="Share"
      title="Share your minted artwork"
      description="Publish a collector-ready link with a stable call-to-action and a fast clipboard flow."
    >
      <div className="card space-y-4">
        <p className="text-sm text-ink">Share link</p>
        <input readOnly value={shareUrl} className="w-full rounded-xl border border-white/20 bg-black/20 p-3 text-sm" />
        <button
          type="button"
          onClick={copyUrl}
          className="gold-button rounded-xl px-4 py-2 text-sm font-semibold"
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </PageShell>
  );
}
