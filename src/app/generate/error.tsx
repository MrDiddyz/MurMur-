'use client';

export default function GenerateError({ reset }: { reset: () => void }) {
  return (
    <div className="card mt-12 space-y-3">
      <p className="text-sm text-rose-300">Generator failed to load.</p>
      <button type="button" onClick={reset} className="gold-button rounded-lg px-3 py-1 text-sm">
        Retry
      </button>
    </div>
  );
}
