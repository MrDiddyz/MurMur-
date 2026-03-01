export default function Nav() {
  return (
    <nav className="mb-6 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex gap-4 text-sm">
        <a href="/dashboard">Dashboard</a>
        <a href="/scenarios">Scenarier</a>
        <a href="/baselines">Baselines</a>
        <a href="/settings">Settings</a>
      </div>
      <form action="/auth/signout" method="post">
        <button className="rounded bg-zinc-800 px-3 py-1 text-sm hover:bg-zinc-700">Logout</button>
      </form>
    </nav>
  );
}
