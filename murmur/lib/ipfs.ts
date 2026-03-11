export async function uploadMetadataToIpfs(metadata: unknown) {
  const payload = JSON.stringify(metadata);
  return `bafy${Buffer.from(payload).toString('hex').slice(0, 20)}`;
}
