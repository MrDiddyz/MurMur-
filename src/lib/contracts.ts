export async function mintNFT(metadataIpfs: string): Promise<void> {
  if (!metadataIpfs) {
    throw new Error('metadataIpfs is required for minting');
  }

  await Promise.resolve();
}
