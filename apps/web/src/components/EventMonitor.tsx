// Displays real-time agent outputs from websocket stream.
interface MonitorProps {
  events: Array<{ ts: number; outputs: unknown[] }>;
}

export function EventMonitor({ events }: MonitorProps) {
  return (
    <div className="panel">
      <h3>EventMonitor</h3>
      {events.slice(-8).reverse().map((event) => (
        <pre key={event.ts} style={{ whiteSpace: "pre-wrap" }}>
          {new Date(event.ts).toLocaleTimeString()}\n{JSON.stringify(event.outputs, null, 2)}
        </pre>
      ))}
    </div>
  );
}
