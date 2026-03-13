"use client";

import { useState } from "react";
import type { FeedbackValue } from "@/types/murmur";

interface FeedbackBarProps {
  episodeId: string;
}

export function FeedbackBar({ episodeId }: FeedbackBarProps) {
  const [submitted, setSubmitted] = useState<FeedbackValue | null>(null);
  const [error, setError] = useState<string>("");

  const sendFeedback = async (feedback: FeedbackValue) => {
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId, feedback })
      });

      if (!response.ok) {
        let errorMessage = `Failed to submit feedback (${response.status})`;
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload?.error) {
            errorMessage = payload.error;
          }
        } catch {
          // JSON parsing failed, use status-based error message
        }
        throw new Error(errorMessage);
      }

      setSubmitted(feedback);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unknown error");
    }
  };

  return (
    <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span>Was this useful?</span>
      <button
        type="button"
        disabled={submitted !== null}
        onClick={() => sendFeedback(1)}
        style={{ borderRadius: 8, border: "1px solid #ccc", padding: "0.4rem 0.6rem", background: "white" }}
      >
        👍
      </button>
      <button
        type="button"
        disabled={submitted !== null}
        onClick={() => sendFeedback(-1)}
        style={{ borderRadius: 8, border: "1px solid #ccc", padding: "0.4rem 0.6rem", background: "white" }}
      >
        👎
      </button>
      {submitted ? <span>Thanks for your feedback.</span> : null}
      {error ? <span style={{ color: "#b00020" }}>{error}</span> : null}
    </div>
  );
}
