export type GalleryItem = {
  tokenId: number;
  tokenUri: string;
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const TOKEN_COUNTER_SELECTOR = "a66cc928"; // tokenCounter()
const TOKEN_URI_SELECTOR = "c87b56dd"; // tokenURI(uint256)

function getEthereumProvider(): EthereumProvider {
  const provider = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  if (!provider) {
    throw new Error("No injected wallet found. Install a web3 wallet to load NFT data.");
  }
  return provider;
}

function toHex32(value: number): string {
  return value.toString(16).padStart(64, "0");
}

function parseUintHex(hexResult: string): number {
  return Number.parseInt(hexResult.replace(/^0x/, ""), 16);
}

function decodeDynamicString(hexResult: string): string {
  const clean = hexResult.replace(/^0x/, "");
  const offset = Number.parseInt(clean.slice(0, 64), 16) * 2;
  const length = Number.parseInt(clean.slice(offset, offset + 64), 16) * 2;
  const data = clean.slice(offset + 64, offset + 64 + length);
  const bytes = new Uint8Array(data.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
  return new TextDecoder().decode(bytes);
}

async function ethCall(contractAddress: string, data: string): Promise<string> {
  const provider = getEthereumProvider();
  const response = await provider.request({
    method: "eth_call",
    params: [{ to: contractAddress, data: `0x${data}` }, "latest"],
  });

  if (typeof response !== "string") {
    throw new Error("Unexpected eth_call response type.");
  }

  return response;
}

export async function getGalleryItems({
  contractAddress,
}: {
  contractAddress: string;
}): Promise<GalleryItem[]> {
  const trimmed = contractAddress.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    throw new Error("Contract address must be a valid 0x-prefixed address.");
  }

  const counterResult = await ethCall(trimmed, TOKEN_COUNTER_SELECTOR);
  const tokenCounter = parseUintHex(counterResult);

  const items: GalleryItem[] = [];
  for (let tokenId = 0; tokenId < tokenCounter; tokenId += 1) {
    const tokenUriResult = await ethCall(trimmed, `${TOKEN_URI_SELECTOR}${toHex32(tokenId)}`);
    items.push({ tokenId, tokenUri: decodeDynamicString(tokenUriResult) });
  }

  return items;
}
