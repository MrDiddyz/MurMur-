import 'server-only';

function readRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return value;
}

export function getPinataJwt(): string {
  return readRequiredEnv('PINATA_JWT');
}

export function getMinterPrivateKey(): string {
  return readRequiredEnv('MINTER_PRIVATE_KEY');
}
