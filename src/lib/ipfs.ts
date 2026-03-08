export type IpfsUploadResponse = {
  metadataIpfs: string;
};

export async function uploadFileToIpfs(file: File): Promise<IpfsUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/ipfs', {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as Partial<IpfsUploadResponse> | null;

  if (!response.ok || !data?.metadataIpfs) {
    throw new Error('Failed to upload artwork metadata to IPFS.');
  }

  return {
    metadataIpfs: data.metadataIpfs,
  };
}
