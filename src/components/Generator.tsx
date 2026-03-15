'use client';

import { FormEvent, useState } from 'react';

type GenerateResponse = {
  images?: string[];
  imageUrls?: string[];
  data?: string[];
  error?: string;
};

export default function Generator() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter a prompt before generating images.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const payload = (await response.json()) as GenerateResponse;

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to generate images.');
      }

      const nextImages = payload.images ?? payload.imageUrls ?? payload.data ?? [];

      if (!Array.isArray(nextImages) || nextImages.length === 0) {
        throw new Error('No images were returned. Try another prompt.');
      }

      setImages(nextImages.slice(0, 4));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while generating images.';
      setError(message);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-slate-700">
          Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe the scene you want to generate..."
          rows={4}
          className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((url, index) => (
          <article key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img
              src={url}
              alt={`Generated result ${index + 1}`}
              className="aspect-square h-full w-full object-cover"
              loading="lazy"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
