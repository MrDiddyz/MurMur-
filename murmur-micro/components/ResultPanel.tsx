import type { RunApiResponse } from "@/types/murmur";

interface ResultPanelProps {
  result: RunApiResponse;
}

export function ResultPanel({ result }: ResultPanelProps) {
  return (
    <section
      style={{
        border: "1px solid #d8d8e4",
        borderRadius: 10,
        background: "white",
        padding: "1rem",
        marginBottom: "1rem"
      }}
    >
      <h2 style={{ marginTop: 0 }}>Final Output</h2>
      <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{result.final}</p>

      <div style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
        <div>
          <strong>Winner Agent:</strong> {result.winner}
        </div>
        <div>
          <strong>Rationale:</strong> {result.rationale}
        </div>
        <div>
          <strong>Score:</strong> {result.score}
        </div>
        <div>
          <strong>Episode ID:</strong> {result.episodeId}
        </div>
      </div>
    </section>
  );
}
