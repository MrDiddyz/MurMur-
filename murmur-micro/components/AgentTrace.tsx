import type { AgentResult } from "@/types/murmur";

interface AgentTraceProps {
  trace: AgentResult[];
}

export function AgentTrace({ trace }: AgentTraceProps) {
  return (
    <section
      style={{
        border: "1px solid #d8d8e4",
        borderRadius: 10,
        background: "white",
        padding: "1rem"
      }}
    >
      <h3 style={{ marginTop: 0 }}>Agent Trace</h3>
      {trace.map((step, index) => (
        <article
          key={`${step.agent}-${index}`}
          style={{ borderTop: index === 0 ? "none" : "1px solid #efeff5", paddingTop: "0.75rem", marginTop: "0.75rem" }}
        >
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>{step.agent.toUpperCase()}</strong>
            {typeof step.score === "number" ? <span> — score: {step.score}</span> : null}
          </div>
          <details>
            <summary style={{ fontWeight: 600 }}>Input</summary>
            <pre style={{ whiteSpace: "pre-wrap", margin: "0.5rem 0 0" }}>{step.input}</pre>
          </details>
          <details style={{ marginTop: "0.5rem" }}>
            <summary style={{ fontWeight: 600 }}>Output</summary>
            <pre style={{ whiteSpace: "pre-wrap", margin: "0.5rem 0 0" }}>{step.output}</pre>
          </details>
        </article>
      ))}
    </section>
  );
}
