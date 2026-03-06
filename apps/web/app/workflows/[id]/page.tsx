async function getWorkflow(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10000";
  const [workflowRes, eventsRes] = await Promise.all([
    fetch(`${apiUrl}/workflows/${id}`, { cache: "no-store" }),
    fetch(`${apiUrl}/workflows/${id}/events`, { cache: "no-store" })
  ]);
  const workflow = await workflowRes.json();
  const events = await eventsRes.json();
  return { workflow, events: events.events ?? [] };
}

export default async function WorkflowPage({ params }: { params: { id: string } }) {
  const { workflow, events } = await getWorkflow(params.id);

  return (
    <main>
      <h1>Workflow {params.id}</h1>
      <p>Status: <strong>{workflow.status}</strong></p>
      <p>Prompt: {workflow.prompt}</p>
      <p>Result: {workflow.result ?? "(pending)"}</p>
      <h2>Events</h2>
      <ul>
        {events.map((event: any) => <li key={event.id}>{event.type}: {event.message}</li>)}
      </ul>
      <h2>Checkpoints summary</h2>
      <ul>
        {(workflow.checkpoints ?? []).map((cp: any) => <li key={cp.id}>{cp.step}: {(cp.data?.summary ?? "")}</li>)}
      </ul>
    </main>
  );
}
