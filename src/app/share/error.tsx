'use client';

export default function ShareError({ reset }: { reset: () => void }) {
  return (
    <div className="card mt-12 space-y-3">
      <p className="text-sm text-rose-300">Share page could not be loaded.</p>
      <button type="button" onClick={reset} className="gold-button rounded-lg px-3 py-1 text-sm">
        Retry
      </button>
    </div>
  );
}
