const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";

export async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
    headers: { "content-type": "application/json" }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API request failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}
