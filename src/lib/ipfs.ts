export type ArtworkMetadataInput = {
  imageUrl: string;
  name: string;
  description: string;
};

export type UploadArtworkResult = {
  metadataIpfs: string;
};

export async function uploadArtworkAndMetadata({
  imageUrl,
  name,
  description,
}: ArtworkMetadataInput): Promise<UploadArtworkResult> {
  if (!imageUrl) {
    throw new Error('imageUrl is required to upload metadata');
  }

  const mockPayload = { image: imageUrl, name, description };
  const encoded = encodeURIComponent(JSON.stringify(mockPayload));

  return {
    metadataIpfs: `ipfs://mock-murmur-metadata?payload=${encoded}`,
  };
}
