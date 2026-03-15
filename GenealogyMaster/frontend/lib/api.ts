export async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json() as Promise<T>;
}
