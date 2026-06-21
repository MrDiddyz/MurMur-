export async function pinJson(json: unknown) {
  return { IpfsHash: `pinata-${Date.now()}`, json };
}
