export type MurmurStatus = {
  server: string;
  port: number;
  online: boolean;
  timestamp: string;
};

export async function fetchStatus(): Promise<MurmurStatus> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/status`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Failed to fetch status");
  }

  return (await res.json()) as MurmurStatus;
}
