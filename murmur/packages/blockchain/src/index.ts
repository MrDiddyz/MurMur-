export interface MintRequest {
  walletAddress: string;
  metadataUri: string;
}

export interface MintReceipt {
  tokenId: string;
  transactionHash: string;
  metadataUri: string;
  owner: string;
  mintedAt: string;
}

export class BlockchainMinter {
  private readonly minted: MintReceipt[] = [];

  async mintNft(request: MintRequest): Promise<MintReceipt> {
    const tokenId = String(this.minted.length + 1);
    const transactionHash = this.buildTransactionHash(tokenId, request.walletAddress);

    const receipt: MintReceipt = {
      tokenId,
      transactionHash,
      metadataUri: request.metadataUri,
      owner: request.walletAddress,
      mintedAt: new Date().toISOString()
    };

    this.minted.push(receipt);

    return receipt;
  }

  async listMintedNfts(ownerAddress?: string): Promise<MintReceipt[]> {
    if (!ownerAddress) {
      return [...this.minted];
    }

    const ownerAddressLower = ownerAddress.toLowerCase();

    return this.minted.filter((receipt) => receipt.owner.toLowerCase() === ownerAddressLower);
  }

  private buildTransactionHash(tokenId: string, walletAddress: string): string {
    const normalized = walletAddress.replace(/^0x/, '').toLowerCase().padStart(40, '0').slice(0, 40);
    const tokenSegment = Number(tokenId).toString(16).padStart(24, '0');

    return `0x${normalized}${tokenSegment}`;
  }
}
