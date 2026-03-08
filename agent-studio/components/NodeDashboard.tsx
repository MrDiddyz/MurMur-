"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Node = {
  id: string;
  name: string;
  status: string;
  containerName?: string;
  cpu?: number;
  memory?: number;
  cpuQuota?: number;
  memQuota?: number;
  overshootCC?: number;
};

function usageColor(percent: number) {
  if (percent > 1) return "#ef4444";
  if (percent > 0.8) return "#f59e0b";
  return "#22c55e";
}

function usagePercent(total: number, max: number) {
  if (max <= 0) return 0;
  return total / max;
}

export default function NodeDashboard() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [error, setError] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  const summary = useMemo(() => {
    const totalCPU = nodes.reduce((acc, n) => acc + (n.cpu ?? 0), 0);
    const maxCPU = nodes.reduce((acc, n) => acc + (n.cpuQuota ?? 0), 0);
    const totalMemory = nodes.reduce((acc, n) => acc + (n.memory ?? 0), 0);
    const maxMemory = nodes.reduce((acc, n) => acc + (n.memQuota ?? 0), 0);

    return { totalCPU, maxCPU, totalMemory, maxMemory };
  }, [nodes]);

  useEffect(() => {
    const supabase = createClient();

    let isMounted = true;

    const updateNode = (updatedNode: Node) => {
      setNodes((prev) => {
        const idx = prev.findIndex((n) => n.id === updatedNode.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = updatedNode;
          return next;
        }
        return [...prev, updatedNode];
      });
    };

    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!isMounted) return;

      const token = sessionData.session?.access_token;
      if (!token) {
        setError("Not logged in");
        return;
      }

      const registryUrl = process.env.NEXT_PUBLIC_NODE_REGISTRY_URL;
      const wsUrl = process.env.NEXT_PUBLIC_NODE_REGISTRY_WS_URL;

      if (!registryUrl || !wsUrl) {
        setError("Node registry configuration is missing");
        return;
      }

      try {
        const res = await fetch(`${registryUrl}/nodes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setError(`Failed loading nodes: ${res.status}`);
          return;
        }

        const json = (await res.json()) as Node[];
        if (!isMounted) return;
        setNodes(json);
      } catch {
        if (isMounted) {
          setError("Unable to load nodes");
        }
        return;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => ws.send(JSON.stringify({ token }));
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data) as { type?: string; node?: Node };
        if (msg.type === "NODE_UPDATE" && msg.node) {
          updateNode(msg.node);
        }
      };
      ws.onerror = () => {
        if (isMounted) {
          setError("WebSocket connection error");
        }
      };
    };

    void init();

    return () => {
      isMounted = false;
      wsRef.current?.close();
    };
  }, []);

  const totalCpuPercent = usagePercent(summary.totalCPU, summary.maxCPU);
  const totalMemPercent = usagePercent(summary.totalMemory, summary.maxMemory);

  return (
    <main style={{ padding: 24 }}>
      <h1>Node Dashboard</h1>
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      <div style={{ marginBottom: 16 }}>
        <div>Total CPU Usage:</div>
        <div style={{ width: "100%", background: "#eee", height: 16, borderRadius: 4 }}>
          <div
            style={{
              width: `${Math.min(totalCpuPercent, 1) * 100}%`,
              height: 16,
              borderRadius: 4,
              background: usageColor(totalCpuPercent),
            }}
          />
        </div>
        <div>Total Memory Usage:</div>
        <div style={{ width: "100%", background: "#eee", height: 16, borderRadius: 4 }}>
          <div
            style={{
              width: `${Math.min(totalMemPercent, 1) * 100}%`,
              height: 16,
              borderRadius: 4,
              background: usageColor(totalMemPercent),
            }}
          />
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th>Name</th>
            <th>Status</th>
            <th>Container</th>
            <th>CPU / Max</th>
            <th>Memory / Max</th>
            <th>Overshoot CC</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((n) => {
            const cpuPercent = usagePercent(n.cpu ?? 0, n.cpuQuota ?? 0);
            const memPercent = usagePercent(n.memory ?? 0, n.memQuota ?? 0);

            return (
              <tr key={n.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{n.name}</td>
                <td>{n.status}</td>
                <td>{n.containerName ?? "-"}</td>
                <td>
                  <div style={{ width: "100%", background: "#eee", height: 12, borderRadius: 4 }}>
                    <div
                      style={{
                        width: `${Math.min(cpuPercent, 1) * 100}%`,
                        height: 12,
                        borderRadius: 4,
                        background: usageColor(cpuPercent),
                      }}
                    />
                  </div>
                  {n.cpu ?? "-"} / {n.cpuQuota ?? "-"}
                </td>
                <td>
                  <div style={{ width: "100%", background: "#eee", height: 12, borderRadius: 4 }}>
                    <div
                      style={{
                        width: `${Math.min(memPercent, 1) * 100}%`,
                        height: 12,
                        borderRadius: 4,
                        background: usageColor(memPercent),
                      }}
                    />
                  </div>
                  {n.memory ?? "-"} / {n.memQuota ?? "-"}
                </td>
                <td>{n.overshootCC ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
