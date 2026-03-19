import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createDashboardServerSupabaseClient } from "../../lib/supabase";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = createDashboardServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <main>{children}</main>;
}
