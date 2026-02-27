"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Outbound =
  | { type: "start_session"; image: string; command: string[] }
  | { type: "stdin"; data: string }
  | { type: "stop" };

type Inbound =
  | { type: "ready"; message: string }
  | { type: "session_started"; sessionId: string; dbSessionId: string }
  | { type: "stdout"; chunk: string }
  | { type: "stderr"; chunk: string }
  | { type: "exit"; code: number | null }
  | { type: "error"; message: string };

const baseWsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8787/ws";
const userEmail = process.env.NEXT_PUBLIC_USER_EMAIL ?? "admin@murmur.local";
const WS_URL = `${baseWsUrl}?email=${encodeURIComponent(userEmail)}`;

export default function TerminalPage() {
  const [logs, setLogs] = useState<string[]>(["> connecting...\n"]);
  const [input, setInput] = useState("echo hello from MurMur\n");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL, []);

    ws.onopen = () => setLogs((prev) => [...prev, "> connected\n"]);
    ws.onclose = () => setLogs((prev) => [...prev, "> disconnected\n"]);
    ws.onerror = () => setLogs((prev) => [...prev, "> websocket error\n"]);
    ws.onmessage = (event) => {
      const payload: Inbound = JSON.parse(event.data as string);
      if (payload.type === "stdout" || payload.type === "stderr") {
        setLogs((prev) => [...prev, payload.chunk]);
      } else if (payload.type === "session_started") {
        setLogs((prev) => [...prev, `> session ${payload.sessionId} (${payload.dbSessionId}) started\n`]);
      } else if (payload.type === "ready") {
        setLogs((prev) => [...prev, `> ${payload.message}\n`]);
      } else if (payload.type === "exit") {
        setLogs((prev) => [...prev, `> process exited: ${payload.code}\n`]);
      } else if (payload.type === "error") {
        setLogs((prev) => [...prev, `> error: ${payload.message}\n`]);
      }
    };

    setSocket(ws);

    return () => ws.close();
  }, []);

  const send = (payload: Outbound) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setLogs((prev) => [...prev, "> socket not open\n"]);
      return;
    }
    socket.send(JSON.stringify(payload));
  };

  const terminalOutput = useMemo(() => logs.join(""), [logs]);

  const onStart = () => {
    send({
      type: "start_session",
      image: "alpine:3.20",
      command: ["sh", "-lc", "while read line; do eval \"$line\"; done"]
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    send({ type: "stdin", data: input });
  };

  return (
    <main style={{ maxWidth: 920, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>MurMur Terminal Gateway</h1>
      <p>Prisma-backed RBAC terminal session over WebSocket + Docker.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={onStart}>Start session</button>
        <button onClick={() => send({ type: "stop" })}>Stop session</button>
      </div>

      <pre style={{ minHeight: 320, border: "1px solid #374151", borderRadius: 8, padding: 12, whiteSpace: "pre-wrap" }}>{terminalOutput}</pre>

      <form onSubmit={onSubmit} style={{ marginTop: 12, display: "grid", gap: 8 }}>
        <textarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send stdin</button>
      </form>
    </main>
  );
}
