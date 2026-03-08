import 'server-only';

const PINATA_API_BASE = 'https://api.pinata.cloud/pinning';

type PinataFileResponse = {
  IpfsHash: string;
};

type PinataJsonResponse = {
  IpfsHash: string;
};

function getPinataJwt(): string {
  const jwt = process.env.PINATA_JWT;

  if (!jwt) {
    throw new Error('PINATA_JWT is not configured.');
  }

  return jwt;
}

async function parsePinataResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Pinata upload failed (${response.status}): ${body}`);
  }

  return (await response.json()) as T;
}

export async function uploadFileToPinata(file: File, name: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, file.name || 'upload');
  formData.append(
    'pinataMetadata',
    JSON.stringify({
      name,
    }),
  );

  const response = await fetch(`${PINATA_API_BASE}/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getPinataJwt()}`,
    },
    body: formData,
  });

  const data = await parsePinataResponse<PinataFileResponse>(response);
  return data.IpfsHash;
}

export async function uploadJsonToPinata(payload: object, name: string): Promise<string> {
  const response = await fetch(`${PINATA_API_BASE}/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getPinataJwt()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataMetadata: {
        name,
      },
      pinataContent: payload,
    }),
  });

  const data = await parsePinataResponse<PinataJsonResponse>(response);
  return data.IpfsHash;
}
