import { AuthControls } from '@/app/settings/auth-controls';
import { getServerSessionUser } from '@/lib/supabase/server-session';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { authError?: string };
}) {
  const user = await getServerSessionUser();

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-3 text-sm text-slate-700">
          Logged-in user:{' '}
          <span className="font-mono">
            {user ? `${user.userId}${user.email ? ` (${user.email})` : ''}` : 'Not signed in'}
          </span>
        </p>
        {searchParams?.authError ? (
          <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Auth callback warning: <span className="font-mono">{searchParams.authError}</span>
          </p>
        ) : null}
      </section>
      <AuthControls />
    </main>
  );
}
