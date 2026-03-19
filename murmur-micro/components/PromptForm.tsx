"use client";

import { FormEvent } from "react";

interface PromptFormProps {
  prompt: string;
  setPrompt: (value: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

export function PromptForm({ prompt, setPrompt, loading, onSubmit }: PromptFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <label htmlFor="prompt" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
        Enter your prompt
      </label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Example: Give me a 30-day plan to launch an AI product"
        rows={6}
        style={{ width: "100%", padding: "0.75rem", borderRadius: 8, border: "1px solid #ccc" }}
      />
      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        style={{
          marginTop: "0.75rem",
          border: "none",
          borderRadius: 8,
          padding: "0.65rem 1rem",
          background: loading ? "#8aa7ff" : "#315efb",
          color: "white",
          fontWeight: 600
        }}
      >
        {loading ? "Running agents..." : "Run MurMur"}
      </button>
    </form>
  );
}
