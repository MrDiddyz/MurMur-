// Studio UI page for MurMur Motion Avatar v0.2.
import { useEffect, useMemo, useState } from "react";
import type { StudioMode } from "@murmur/shared";
import { AvatarCanvas } from "../components/AvatarCanvas";
import { EventMonitor } from "../components/EventMonitor";
import { ModeSwitcher } from "../components/ModeSwitcher";
import { createSession, ingestMockAudioEvent, updateSessionMode, wsUrl } from "../lib/api";

export function StudioPage() {
  const [mode, setMode] = useState<StudioMode>("ID");
  const [sessionId, setSessionId] = useState<string>("");
  const [feed, setFeed] = useState<Array<{ ts: number; outputs: unknown[] }>>([]);
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [wsState, setWsState] = useState<"connecting" | "open" | "closed">("connecting");

  useEffect(() => {
    createSession(mode).then((session) => setSessionId(session.id));
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    updateSessionMode(sessionId, mode).catch(() => undefined);
  }, [sessionId, mode]);

  useEffect(() => {
    if (!sessionId) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;

    const connect = () => {
      setWsState("connecting");
      socket = new WebSocket(wsUrl);

      socket.onopen = () => setWsState("open");
      socket.onclose = () => {
        setWsState("closed");
        reconnectTimer = window.setTimeout(connect, 1200);
      };
      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data) as { type: string; sessionId: string; ts: number; outputs: unknown[] };
        if (payload.type === "agent-output" && payload.sessionId === sessionId) {
          setFeed((prev) => [...prev, { ts: payload.ts, outputs: payload.outputs }].slice(-50));
        }
      };
    };

    connect();

    return () => {
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !isSimRunning) return;
    const timer = setInterval(() => ingestMockAudioEvent(sessionId), 1200);
    return () => clearInterval(timer);
  }, [sessionId, isSimRunning]);

  const monitorTitle = useMemo(() => `Feed: ${feed.length} events · WS ${wsState}`, [feed.length, wsState]);

  return (
    <div className="studio-grid">
      <div className="panel">
        <h2>MurMur Avatar Studio</h2>
        <ModeSwitcher mode={mode} onChange={setMode} />
        <p>Session: {sessionId || "initializing..."}</p>
        <button onClick={() => setIsSimRunning((v) => !v)}>{isSimRunning ? "Pause input" : "Resume input"}</button>
        <AvatarCanvas />
      </div>
      <div>
        <h3>{monitorTitle}</h3>
        <EventMonitor events={feed} />
      </div>
    </div>
  );
}
