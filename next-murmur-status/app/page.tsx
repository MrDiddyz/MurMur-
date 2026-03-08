"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  appendArtworkToHistory,
  ArtworkRecord,
  readArtworkHistory,
} from "../lib/history";

const DEFAULT_STYLES = ["cinematic", "surreal", "neon"] as const;

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createImageUrl(prompt: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/640/640`;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [stylesInput, setStylesInput] = useState(DEFAULT_STYLES.join(", "));
  const [history, setHistory] = useState<ArtworkRecord[]>(() => readArtworkHistory());

  const parsedStyles = useMemo(
    () =>
      stylesInput
        .split(",")
        .map((style) => style.trim())
        .filter(Boolean),
    [stylesInput],
  );

  const onGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safePrompt = prompt.trim();

    if (!safePrompt) {
      return;
    }

    const item: ArtworkRecord = {
      id: createId(),
      prompt: safePrompt,
      imageUrl: createImageUrl(safePrompt),
      label: safePrompt.slice(0, 40),
      styles: parsedStyles,
      createdAt: new Date().toISOString(),
    };

    const next = appendArtworkToHistory(item);
    setHistory(next);
    setPrompt("");
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, color: "#111" }}>
      <h1>MurMur Art Generator (MVP)</h1>
      <form onSubmit={onGenerate} style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <label>
          Prompt
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="A bioluminescent whale flying through city fog"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>
        <label>
          Styles (comma separated)
          <input
            value={stylesInput}
            onChange={(event) => setStylesInput(event.target.value)}
            placeholder="cinematic, neon"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>
        <button type="submit" style={{ width: "fit-content", padding: "10px 14px" }}>
          Generate artwork
        </button>
      </form>

      <section>
        <h2>Generated artworks</h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {history.map((item) => (
            <article key={item.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
              <img
                src={item.imageUrl}
                alt={item.prompt}
                width={260}
                height={260}
                style={{ width: "100%", borderRadius: 8, objectFit: "cover" }}
              />
              <h3 style={{ margin: "12px 0 6px" }}>{item.label}</h3>
              <p style={{ margin: "0 0 8px", color: "#555" }}>{item.prompt}</p>
              <p style={{ margin: "0 0 12px", fontSize: 13 }}>#{item.styles.join(" #")}</p>
              <Link href={`/art/${item.id}`} style={{ textDecoration: "underline" }}>
                Share Page
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
