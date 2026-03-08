import { cookies } from "next/headers";
import { createSupabaseBrowserClient, createSupabaseServerClient } from "@murmur/config";

export function createDashboardBrowserSupabaseClient() {
  return createSupabaseBrowserClient();
}

export function createDashboardServerSupabaseClient() {
  const cookieStore = cookies();

  return createSupabaseServerClient({
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set() {
      return;
    },
    remove() {
      return;
    }
  });
}
