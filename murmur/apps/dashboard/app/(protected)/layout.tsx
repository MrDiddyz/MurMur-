import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createDashboardServerSupabaseClient } from "../../lib/supabase";
import { getUserRole } from "../../lib/auth";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = createDashboardServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = getUserRole(user);

  return (
    <main data-user-role={role ?? "unassigned"}>
      {children}
    </main>
  );
}
