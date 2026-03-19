// API helpers for session bootstrap, mode updates, and event simulation.
import type { StudioMode } from "@murmur/shared";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export async function createSession(mode: StudioMode) {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artistId: "artist-demo", mode })
  });
  if (!response.ok) throw new Error("Failed to create session");
  return response.json();
}

export async function updateSessionMode(sessionId: string, mode: StudioMode) {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/mode`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode })
  });
  if (!response.ok) throw new Error("Failed to update session mode");
  return response.json();
}

export async function ingestMockAudioEvent(sessionId: string) {
  return fetch(`${API_BASE}/events/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      type: "audio",
      sessionId,
      timestamp: Date.now(),
      payload: { bpm: 122, energy: Math.random(), centroid: 0.44 }
    })
  });
}

export const wsUrl = (import.meta.env.VITE_WS_URL as string | undefined) ?? "ws://localhost:4000/ws";
