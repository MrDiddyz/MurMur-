export async function uploadArtworkAndMetadata(params: {
  imageUrl: string
  name?: string
  description?: string
}) {
  const res = await fetch('/api/ipfs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error('Failed to upload to IPFS')
  }

  return res.json() as Promise<{
    imageIpfs: string
    metadataIpfs: string
  }>
}
