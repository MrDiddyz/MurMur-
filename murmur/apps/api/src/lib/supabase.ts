import { createSupabaseAdminClient } from "@murmur/config";

let client: ReturnType<typeof createSupabaseAdminClient> | null = null;

export function getSupabaseAdminClient() {
  if (!client) {
    client = createSupabaseAdminClient();
  }

  return client;
}
