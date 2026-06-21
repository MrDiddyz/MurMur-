'use client';

export default function MintButton({ artworkId }: { artworkId: string }) {
  return (
    <button className="rounded bg-emerald-600 px-4 py-2 font-medium text-white">
      Mint Artwork {artworkId}
    </button>
  );
}
