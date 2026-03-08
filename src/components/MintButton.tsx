'use client';

import { useEffect, useMemo, useState } from 'react';
import { getConnectedAddress, mintNft } from '@/lib/contracts';
import { uploadFileToIpfs } from '@/lib/ipfs';

type MintButtonProps = {
  files: File[];
};

export function MintButton({ files }: MintButtonProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedFile = useMemo(() => files[selectedIndex] ?? null, [files, selectedIndex]);

  useEffect(() => {
    if (files.length === 0) {
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex((previous) => (previous >= files.length ? 0 : previous));
  }, [files]);

  const handleMint = async () => {
    if (!selectedFile) {
      setError('Select artwork before minting.');
      return;
    }

    setIsMinting(true);
    setError(null);
    setSuccess(null);

    try {
      const { metadataIpfs } = await uploadFileToIpfs(selectedFile);
      const to = await getConnectedAddress();
      const result = await mintNft(to, metadataIpfs);
      setSuccess(`Minted successfully. Tx: ${result.hash}`);
    } catch (mintError) {
      const message = mintError instanceof Error ? mintError.message : 'Minting failed.';
      setError(message);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <section className="murmur-panel">
      <h3>NFT Mint</h3>
      <p className="murmur-muted">Upload artwork metadata to IPFS, then mint on-chain.</p>

      <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
        <label>
          <span className="murmur-muted">Artwork</span>
          <select
            value={selectedIndex}
            onChange={(event) => {
              setSelectedIndex(Number(event.target.value));
              setError(null);
              setSuccess(null);
            }}
            disabled={files.length === 0 || isMinting}
            style={{ width: '100%', marginTop: '0.35rem' }}
          >
            {files.length === 0 ? <option value={0}>No artwork available</option> : null}
            {files.map((file, index) => (
              <option key={`${file.name}-${index}`} value={index}>
                {file.name}
              </option>
            ))}
          </select>
        </label>

        <div className="murmur-row">
          <button type="button" onClick={handleMint} disabled={isMinting || !selectedFile}>
            {isMinting ? 'Minting…' : 'Mint selected artwork'}
          </button>
        </div>

        {error ? <p style={{ color: '#ff9b9b' }}>{error}</p> : null}
        {success ? <p style={{ color: '#b8ffc8' }}>{success}</p> : null}
      </div>
    </section>
  );
}
