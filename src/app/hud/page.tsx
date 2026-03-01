'use client';

import { useEffect, useMemo, useState } from 'react';

type RuntimeEvent = {
  id?: string;
  type: string;
  ts: number;
  payload?: Record<string, unknown>;
};

const MAX_EVENTS = 20;
const WS_URL = process.env.NEXT_PUBLIC_RUNTIME_WS_URL ?? 'ws://localhost:3001';

export default function HudPage() {
  const [currentSection, setCurrentSection] = useState('unknown');
  const [events, setEvents] = useState<RuntimeEvent[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    let isAlive = true;
    const socket = new WebSocket(WS_URL);

    socket.addEventListener('open', () => {
      if (isAlive) setStatus('connected');
    });

    socket.addEventListener('close', () => {
      if (isAlive) setStatus('disconnected');
    });

    socket.addEventListener('error', () => {
      if (isAlive) setStatus('disconnected');
    });

    socket.addEventListener('message', (message) => {
      if (!isAlive) return;

      try {
        const event = JSON.parse(message.data) as RuntimeEvent;

        if (event.type === 'section.enter' && typeof event.payload?.section === 'string') {
          setCurrentSection(event.payload.section);
        }

        if (event.type === 'state.snapshot' && typeof event.payload?.currentSection === 'string') {
          setCurrentSection(event.payload.currentSection);
        }

        setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
      } catch {
        // ignore malformed payloads
      }
    });

    return () => {
      isAlive = false;
      socket.close();
    };
  }, []);

  const statusTone = useMemo(() => {
    if (status === 'connected') return 'text-green-400';
    if (status === 'connecting') return 'text-amber-300';
    return 'text-red-400';
  }, [status]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Runtime HUD</h1>
          <p className={`text-sm ${statusTone}`}>
            WS: {status} ({WS_URL})
          </p>
        </header>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-sm uppercase tracking-wide text-zinc-400">Current section</h2>
          <p className="mt-2 text-2xl font-bold">{currentSection}</p>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-sm uppercase tracking-wide text-zinc-400">Last {MAX_EVENTS} events</h2>
          <ul className="mt-4 space-y-3">
            {events.map((event, idx) => (
              <li key={event.id ?? `${event.type}-${event.ts}-${idx}`} className="rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-cyan-300">{event.type}</span>
                  <span className="text-zinc-500">{new Date(event.ts).toLocaleTimeString()}</span>
                </div>
                {event.payload && (
                  <pre className="mt-2 overflow-x-auto text-xs text-zinc-300">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                )}
              </li>
            ))}
            {events.length === 0 && <li className="text-zinc-500">No events yet.</li>}
          </ul>
        </section>
      </div>
    </main>
  );
}
