"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

const wsUrl = "ws://localhost:8080";

export default function TerminalPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [line, setLine] = useState("");

  useEffect(() => {
    if (!mountRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: { background: "#070b14", foreground: "#dce3f1" }
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(mountRef.current);
    fitAddon.fit();

    const token = localStorage.getItem("murmur_token") || "";
    const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => term.writeln("Connected to MurMur gateway");
    ws.onmessage = (event) => term.write(String(event.data));
    ws.onclose = () => term.writeln("\r\nDisconnected");

    term.onData((data) => ws.send(data));

    const onResize = () => fitAddon.fit();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ws.close();
      term.dispose();
    };
  }, []);

  return (
    <main style={{ display: "grid", gridTemplateRows: "1fr auto", height: "100vh", padding: 12, gap: 8 }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%", border: "1px solid #1f2a44", borderRadius: 8 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,auto) 1fr auto", gap: 8 }}>
        <button onClick={() => wsRef.current?.send("\u001b")} type="button">Esc</button>
        <button onClick={() => wsRef.current?.send("\t")} type="button">Tab</button>
        <button onClick={() => wsRef.current?.send("\u0003")} type="button">Ctrl+C</button>
        <button onClick={() => wsRef.current?.send("\u0004")} type="button">Ctrl+D</button>
        <input
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder="Run command"
          style={{ width: "100%", background: "#0f1727", color: "#dce3f1", border: "1px solid #1f2a44", borderRadius: 6, padding: "10px" }}
        />
        <button
          type="button"
          onClick={() => {
            wsRef.current?.send(`${line}\n`);
            setLine("");
          }}
        >
          Run
        </button>
      </div>
    </main>
  );
}
