'use client';

import { useMemo, useState } from 'react';
import { PageShell } from '@/components/mvp/page-shell';
import { StatusPanel } from '@/components/mvp/status-panel';

type GenerationState = {
  imageUrl: string;
  metadataUrl: string;
  txHash: string;
};

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('dreamlike skyline in aurora colors');
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerationState | null>(null);

  const walletStatus = useMemo(() => {
    if (!walletAddress) {
      return { tone: 'idle' as const, message: 'Wallet not connected yet.' };
    }

    return { tone: 'success' as const, message: `Connected: ${walletAddress}` };
  }, [walletAddress]);

  async function runFlow() {
    setError('');
    setResult(null);
    setIsLoading(true);

    try {
      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const generated = (await generateRes.json()) as { imageUrl?: string; error?: string };
      if (!generateRes.ok || !generated.imageUrl) {
        throw new Error(generated.error ?? 'Generation failed.');
      }

      const ipfsRes = await fetch('/api/ipfs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: generated.imageUrl, prompt }),
      });
      const ipfs = (await ipfsRes.json()) as { metadataUrl?: string; error?: string };
      if (!ipfsRes.ok || !ipfs.metadataUrl) {
        throw new Error(ipfs.error ?? 'IPFS upload failed.');
      }

      const mintRes = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, metadataUrl: ipfs.metadataUrl }),
      });
      const mint = (await mintRes.json()) as { txHash?: string; error?: string };
      if (!mintRes.ok || !mint.txHash) {
        throw new Error(mint.error ?? 'Minting failed.');
      }

      setResult({ imageUrl: generated.imageUrl, metadataUrl: ipfs.metadataUrl, txHash: mint.txHash });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unexpected failure in mint flow.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageShell
      eyebrow="Generator"
      title="Create, upload, and mint"
      description="Reliable step-by-step generator flow with explicit loading and error handling for wallet, IPFS, and minting."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-ink">Prompt</span>
            <textarea
              className="w-full rounded-xl border border-white/20 bg-black/20 p-3"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={3}
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-ink">Wallet address</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-black/20 p-3"
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              placeholder="0x..."
            />
          </label>
          <button
            type="button"
            onClick={runFlow}
            disabled={isLoading || !walletAddress}
            className="gold-button rounded-xl px-4 py-2 text-sm font-semibold"
          >
            {isLoading ? 'Running flow…' : 'Generate + Upload + Mint'}
          </button>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>

        <div className="space-y-3">
          <StatusPanel label="Wallet" tone={walletStatus.tone} message={walletStatus.message} />
          <StatusPanel
            label="Generator"
            tone={isLoading ? 'loading' : result?.imageUrl ? 'success' : 'idle'}
            message={isLoading ? 'Generating artwork...' : result?.imageUrl ? 'Artwork generated.' : 'Waiting to run.'}
          />
          <StatusPanel
            label="IPFS"
            tone={isLoading ? 'loading' : result?.metadataUrl ? 'success' : 'idle'}
            message={isLoading ? 'Uploading metadata...' : result?.metadataUrl ? result.metadataUrl : 'Not uploaded yet.'}
          />
          <StatusPanel
            label="Mint"
            tone={isLoading ? 'loading' : result?.txHash ? 'success' : 'idle'}
            message={isLoading ? 'Minting NFT...' : result?.txHash ? result.txHash : 'Mint not started.'}
          />
        </div>
      </div>
    </PageShell>
  );
}
