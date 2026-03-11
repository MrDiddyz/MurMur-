import { BrowserProvider, type Eip1193Provider } from 'ethers';

export class WalletProviderError extends Error {
  constructor(message = 'No Ethereum wallet provider found. Please install MetaMask or another EIP-1193 wallet.') {
    super(message);
    this.name = 'WalletProviderError';
  }
}

function getEthereumProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new WalletProviderError();
  }

  return window.ethereum;
}

export async function connectWallet() {
  const provider = new BrowserProvider(getEthereumProvider());
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

export function shortenAddress(address: string, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}
