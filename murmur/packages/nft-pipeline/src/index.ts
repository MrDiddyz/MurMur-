import { BlockchainMinter, type MintReceipt } from "@murmur/blockchain";

export interface CreatorFileInput {
  name: string;
  contentType: string;
  bytes: Uint8Array;
}

export interface NftMetadataInput {
  name: string;
  description: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

export interface NftMetadata extends NftMetadataInput {
  image: string;
}

export interface CreatorStudioFlowInput {
  image: CreatorFileInput;
  metadata: NftMetadataInput;
  walletAddress: string;
}

export interface CreatorStudioFlowResult {
  imageIpfsUri: string;
  metadataIpfsUri: string;
  mintReceipt: MintReceipt;
  gallery: MintReceipt[];
}

export class CreatorStudioService {
  constructor(private readonly minter: BlockchainMinter) {}

  async runFlow(input: CreatorStudioFlowInput): Promise<CreatorStudioFlowResult> {
    const imageIpfsUri = await this.pinImageToIpfs(input.image);

    const metadata = this.generateMetadata(input.metadata, imageIpfsUri);
    const metadataIpfsUri = await this.pinMetadataToIpfs(metadata);

    const mintReceipt = await this.minter.mintNft({
      walletAddress: input.walletAddress,
      metadataUri: metadataIpfsUri
    });

    const gallery = await this.refreshGallery(input.walletAddress);

    return {
      imageIpfsUri,
      metadataIpfsUri,
      mintReceipt,
      gallery
    };
  }

  async refreshGallery(walletAddress: string): Promise<MintReceipt[]> {
    return this.minter.listMintedNfts(walletAddress);
  }

  private async pinImageToIpfs(image: CreatorFileInput): Promise<string> {
    const fingerprint = this.createDeterministicFingerprint(`${image.name}|${image.contentType}|${image.bytes.length}`);

    return `ipfs://${fingerprint}`;
  }

  private generateMetadata(metadata: NftMetadataInput, imageIpfsUri: string): NftMetadata {
    return {
      ...metadata,
      image: imageIpfsUri
    };
  }

  private async pinMetadataToIpfs(metadata: NftMetadata): Promise<string> {
    const fingerprint = this.createDeterministicFingerprint(JSON.stringify(metadata));

    return `ipfs://${fingerprint}`;
  }

  private createDeterministicFingerprint(value: string): string {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }

    const unsigned = hash >>> 0;

    return unsigned.toString(16).padStart(8, '0');
  }
}
