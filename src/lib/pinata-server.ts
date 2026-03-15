interface PinataUploadResponse {
  IpfsHash: string;
}

const PINATA_BASE_URL = "https://api.pinata.cloud/pinning";

function getAuthHeaders() {
  const jwt = process.env.PINATA_JWT;

  if (!jwt) {
    throw new Error("PINATA_JWT is not configured.");
  }

  return {
    Authorization: `Bearer ${jwt}`,
  };
}

async function uploadFile(file: File): Promise<PinataUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${PINATA_BASE_URL}/pinFileToIPFS`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Pinata file upload failed: ${message}`);
  }

  return (await response.json()) as PinataUploadResponse;
}

async function uploadJson(payload: unknown): Promise<PinataUploadResponse> {
  const response = await fetch(`${PINATA_BASE_URL}/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Pinata JSON upload failed: ${message}`);
  }

  return (await response.json()) as PinataUploadResponse;
}

export const pinata = {
  upload: {
    file: uploadFile,
    json: uploadJson,
  },
};
