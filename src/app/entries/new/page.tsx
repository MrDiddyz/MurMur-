import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createEntryForUser, getMemoryUserId } from "@/lib/memory/service";

async function createEntryAction(formData: FormData): Promise<void> {
  "use server";

  const textValue = formData.get("text");
  const tagsValue = formData.get("tags");
  const moodValue = formData.get("mood");

  const text = typeof textValue === "string" ? textValue.trim() : "";
  const tagsRaw = typeof tagsValue === "string" ? tagsValue : "";
  const mood = typeof moodValue === "string" ? moodValue : "";

  if (!text) {
    throw new Error("Text is required.");
  }

  const tags = tagsRaw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  await createEntryForUser({
    userId: getMemoryUserId(),
    text,
    tags,
    mood
  });

  revalidatePath("/entries");
  redirect("/entries");
}

export default function NewEntryPage(): JSX.Element {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>New entry</h1>
        <p style={{ marginTop: 0, color: "#666" }}>Capture a thought, tag it, and optionally record your mood.</p>
        <Link href="/entries">← Back to entries</Link>
      </header>

      <form action={createEntryAction} style={{ display: "grid", gap: "1rem" }}>
        <label style={{ display: "grid", gap: "0.4rem" }}>
          <span>Text</span>
          <textarea required rows={5} name="text" placeholder="What happened today?" />
        </label>

        <label style={{ display: "grid", gap: "0.4rem" }}>
          <span>Tags (comma separated)</span>
          <input type="text" name="tags" placeholder="work, reflection" />
        </label>

        <label style={{ display: "grid", gap: "0.4rem" }}>
          <span>Mood (optional)</span>
          <input type="text" name="mood" placeholder="calm" />
        </label>

        <button type="submit" style={{ width: "fit-content" }}>
          Save entry
        </button>
      </form>
    </main>
  );
}
