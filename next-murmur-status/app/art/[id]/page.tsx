"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getArtworkById } from "../../../lib/history";

export default function ArtworkSharePage() {
  const params = useParams<{ id: string }>();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const artwork = useMemo(() => getArtworkById(params.id), [params.id]);

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  if (!artwork) {
    return (
      <main style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
        <h1>Artwork not found</h1>
        <p>This local share page only works in the same browser where the artwork was generated.</p>
        <Link href="/">Back to generator</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
      <Link href="/">← Back</Link>
      <h1 style={{ marginTop: 12 }}>{artwork.label}</h1>
      <img
        src={artwork.imageUrl}
        alt={artwork.prompt}
        width={700}
        height={700}
        style={{ width: "100%", borderRadius: 12, marginTop: 16 }}
      />
      <p style={{ marginTop: 16 }}>{artwork.prompt}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 16px" }}>
        {artwork.styles.map((tag) => (
          <span key={tag} style={{ background: "#f2f2f2", borderRadius: 999, padding: "4px 10px" }}>
            #{tag}
          </span>
        ))}
      </div>
      <button onClick={onCopyLink} type="button" style={{ padding: "10px 14px" }}>
        Copy link
      </button>
      {copyState === "copied" ? <p>Link copied.</p> : null}
      {copyState === "error" ? <p>Unable to copy link in this browser.</p> : null}
    </main>
  );
}
