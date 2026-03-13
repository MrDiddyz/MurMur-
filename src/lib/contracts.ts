type EthersModule = {
  BrowserProvider: new (provider: unknown) => {
    send(method: string, params: unknown[]): Promise<unknown>;
    getSigner(): Promise<{
      getAddress(): Promise<string>;
    }>;
  };
  Contract: new (
    address: string,
    abi: string[],
    signer: unknown,
  ) => {
    mint(to: string, uri: string): Promise<{
      hash: string;
      wait(): Promise<unknown>;
    }>;
  };
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const MINT_ABI = ['function mint(address to, string uri)'];

async function loadEthers(): Promise<EthersModule> {
  const dynamicImport = new Function("specifier", 'return import(specifier)') as (specifier: string) => Promise<EthersModule>;
  return dynamicImport('https://esm.sh/ethers@6?bundle');
}

function getContractAddress() {
  const address = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

  if (!address) {
    throw new Error('Missing NEXT_PUBLIC_NFT_CONTRACT_ADDRESS environment variable.');
  }

  return address;
}

async function getProviderAndSigner() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet detected. Please install MetaMask (or another EVM wallet).');
  }

  const { BrowserProvider } = await loadEthers();
  const provider = new BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();

  return { signer };
}

export async function getConnectedAddress() {
  const { signer } = await getProviderAndSigner();
  return signer.getAddress();
}

export async function mintNft(to: string, uri: string) {
  const { Contract } = await loadEthers();
  const { signer } = await getProviderAndSigner();
  const contract = new Contract(getContractAddress(), MINT_ABI, signer);
  const tx = await contract.mint(to, uri);
  const receipt = await tx.wait();

  return {
    hash: tx.hash,
    receipt,
  };
}
