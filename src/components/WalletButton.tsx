'use client';

import { useState } from 'react';

import { connectWallet, shortenAddress, WalletProviderError } from '@/lib/wallet';

export default function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const wallet = await connectWallet();
      setAddress(wallet.address);
    } catch (err) {
      if (err instanceof WalletProviderError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to connect wallet right now. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleConnect}
        disabled={isConnecting}
        className="rounded-md border border-[#826443] bg-[#826443] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6d5237] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {address ? shortenAddress(address) : isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error ? <p className="text-sm text-[#9b2c2c]">{error}</p> : null}
    </div>
  );
}
