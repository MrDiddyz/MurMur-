"use client";

import { useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface EventItem {
  id: string;
  message: string;
  type: string;
  createdAt: string;
}

interface WorkflowData {
  id: string;
  status: string;
  result?: unknown;
}

export default function WorkflowPage({ params }: { params: { id: string } }) {
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      try {
        const [workflowRes, eventRes] = await Promise.all([
          fetch(`${apiUrl}/workflows/${params.id}`),
          fetch(`${apiUrl}/workflows/${params.id}/events`)
        ]);

        if (!workflowRes.ok || !eventRes.ok) {
          throw new Error("Failed to load workflow data");
        }

        const [workflowData, eventData] = await Promise.all([workflowRes.json(), eventRes.json()]);

        if (!disposed) {
          setWorkflow(workflowData);
          setEvents(eventData);
          setError(null);
        }
      } catch (loadError) {
        if (!disposed) {
          setError((loadError as Error).message);
        }
      }
    };

    void load();
    const timer = setInterval(() => {
      void load();
    }, 2000);

    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [params.id]);

  return (
    <main>
      <h1>Workflow {params.id}</h1>
      <p>Status: {workflow?.status ?? "loading"}</p>
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
      <h2>Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            [{event.type}] {event.message}
          </li>
        ))}
      </ul>
      <h2>Result</h2>
      <pre>{JSON.stringify(workflow?.result ?? null, null, 2)}</pre>
    </main>
  );
}
