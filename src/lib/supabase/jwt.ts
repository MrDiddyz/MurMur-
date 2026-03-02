function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function jwtDecode(token: string): unknown {
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Invalid JWT');
  }

  return JSON.parse(decodeBase64Url(parts[1]));
}
