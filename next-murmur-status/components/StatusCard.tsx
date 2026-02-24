"use client";

type Props = {
  server: string;
  port: number;
  online: boolean;
  timestamp: string;
};

export default function StatusCard({ server, port, online, timestamp }: Props) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: "#111",
        color: "#fff",
        border: "1px solid #333",
        maxWidth: "400px"
      }}
    >
      <h2>Murmur Status</h2>
      <p>
        <strong>Server:</strong> {server}:{port}
      </p>
      <p>
        <strong>Status:</strong> {online ? "🟢 Online" : "🔴 Offline"}
      </p>
      <p>
        <small>Updated: {timestamp}</small>
      </p>
    </div>
  );
}
