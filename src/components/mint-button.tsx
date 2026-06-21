'use client';

import { useState } from 'react';
import { uploadArtworkAndMetadata } from '@/lib/ipfs';
import { mintNFT } from '@/lib/contracts';

export default function MintButton({ image }: { image: string }) {
  const [loading, setLoading] = useState(false);

  async function mint() {
    try {
      setLoading(true);

      const { metadataIpfs } = await uploadArtworkAndMetadata({
        imageUrl: image,
        name: 'MurMur Artwork',
        description: 'AI generated art',
      });

      await mintNFT(metadataIpfs);

      alert('NFT minted!');
    } catch (error) {
      console.error(error);
      alert('Mint failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={mint}
      disabled={loading}
      className="mt-2 rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {loading ? 'Minting...' : 'Mint NFT'}
    </button>
  );
}
