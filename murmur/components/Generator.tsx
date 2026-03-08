'use client';

import { useState } from 'react';
import ArtworkCard from './ArtworkCard';

type Generated = { id: string; prompt: string; imageUrl: string };

export default function Generator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<Generated | null>(null);

  async function onGenerate() {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const json = (await res.json()) as Generated;
    setResult(json);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="Describe your artwork"
        />
        <button onClick={onGenerate} className="rounded bg-black px-4 py-2 text-white">Generate</button>
      </div>
      {result && <ArtworkCard id={result.id} prompt={result.prompt} imageUrl={result.imageUrl} />}
    </div>
  );
}
