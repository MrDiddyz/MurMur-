'use client';

import { ChangeEvent, useMemo, useState } from 'react';

type PreviewState = {
  uploadedSrc: string | null;
  prompt: string;
};

export default function StudioPage() {
  const [artworkFileName, setArtworkFileName] = useState<string>('');
  const [uploadedSrc, setUploadedSrc] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('A cinematic neon portrait in the style of a premium AI campaign.');

  const previewState: PreviewState = useMemo(
    () => ({ uploadedSrc, prompt }),
    [uploadedSrc, prompt],
  );

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setArtworkFileName('');
      setUploadedSrc(null);
      return;
    }

    setArtworkFileName(file.name);
    const nextUrl = URL.createObjectURL(file);
    setUploadedSrc(nextUrl);
  };

  return (
    <section className="pb-16 pt-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#090b1d]/95 via-[#0c1029]/90 to-[#04060f]/95 p-6 shadow-[0_0_0_1px_rgba(124,155,255,0.16),0_25px_80px_rgba(0,0,0,0.6)] md:p-10">
        <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">Creative Workspace</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">AI Studio</h1>
          <p className="max-w-2xl text-sm text-ink md:text-base">
            Upload artwork, craft a prompt, preview your generated direction, and publish when it is ready.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-4 text-lg font-medium text-white">Upload panel</h2>
            <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-violet-300/40 bg-violet-500/5 text-center transition hover:border-violet-200/80 hover:bg-violet-500/10">
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <span className="text-sm font-semibold text-violet-100">Drop artwork or click to upload</span>
              <span className="mt-2 text-xs text-ink">PNG, JPG, WEBP</span>
            </label>
            <p className="mt-4 text-xs text-ink">{artworkFileName ? `Selected: ${artworkFileName}` : 'No artwork uploaded yet.'}</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-4 text-lg font-medium text-white">Prompt editor</h2>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={8}
              className="w-full rounded-xl border border-white/15 bg-[#0d142b]/90 p-3 text-sm text-white outline-none ring-violet-300/50 placeholder:text-slate-400 focus:ring-2"
              placeholder="Describe your scene, mood, lighting, and style..."
            />
            <p className="mt-3 text-xs text-ink">Tip: include style cues, camera lens, lighting, and atmosphere.</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
            <h2 className="mb-4 text-lg font-medium text-white">Preview panel</h2>
            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <div className="flex min-h-72 items-center justify-center rounded-xl border border-white/10 bg-[#0b1124] p-4">
                {previewState.uploadedSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewState.uploadedSrc}
                    alt="Uploaded artwork preview"
                    className="h-full max-h-[320px] w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-center text-sm text-slate-300">
                    <p className="font-medium text-violet-200">No image yet</p>
                    <p className="mt-2 text-ink">Upload artwork to see it here.</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-[#070b18] p-4 text-sm text-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">Prompt preview</p>
                <p className="mt-3 leading-relaxed">{previewState.prompt || 'Your prompt will appear here.'}</p>
                <div className="mt-6 rounded-lg border border-emerald-300/20 bg-emerald-500/5 p-3 text-xs text-emerald-100">
                  Status: Draft render ready for publishing.
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="rounded-full border border-fuchsia-300/60 bg-gradient-to-r from-violet-500/40 to-fuchsia-500/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:from-violet-400/50 hover:to-fuchsia-400/50"
          >
            Publish work
          </button>
        </div>
      </div>
    </section>
  );
}
