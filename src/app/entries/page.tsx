import Link from "next/link";
import { getMemoryUserId, listEntriesForUser } from "@/lib/memory/service";

export default async function EntriesPage(): Promise<JSX.Element> {
  const userId = getMemoryUserId();
  const { entries, source } = await listEntriesForUser(userId);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Entries</h1>
          <p style={{ marginTop: "0.5rem", color: "#666" }}>
            Your recent memory entries. Data source: <strong>{source}</strong>
          </p>
        </div>
        <Link href="/entries/new">Create entry</Link>
      </header>

      {entries.length === 0 ? <p>No entries yet. Create your first one.</p> : null}

      <section style={{ display: "grid", gap: "1rem" }}>
        {entries.map((entry) => (
          <article key={entry.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: "1rem" }}>
            <p style={{ marginTop: 0 }}>{entry.text}</p>
            <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              {new Date(entry.createdAt).toLocaleString()}
              {entry.mood ? ` • mood: ${entry.mood}` : ""}
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {entry.tags.map((tag) => (
                <span key={`${entry.id}-${tag}`} style={{ background: "#f1f1f1", borderRadius: 999, padding: "0.2rem 0.65rem", fontSize: "0.8rem" }}>
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
