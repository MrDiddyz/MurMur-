#!/usr/bin/env node

const api = process.env.MURMUR_API || "http://localhost:8081";
const token = process.env.MURMUR_TOKEN || "";

async function request(path, opts = {}) {
  const headers = {
    "content-type": "application/json",
    ...(token ? { authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${api}${path}`, { headers, ...opts });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }

  return response.json();
}

async function main() {
  const [, , resource, action, ...args] = process.argv;

  if (resource === "node" && action === "spawn") {
    const name = args[0] || `node-${Date.now()}`;
    const node = await request("/nodes", {
      method: "POST",
      body: JSON.stringify({ name })
    });
    console.log(JSON.stringify(node, null, 2));
    return;
  }

  if (resource === "node" && action === "list") {
    const nodes = await request("/nodes");
    console.table(nodes.map((n) => ({ id: n.id, name: n.name, status: n.status })));
    return;
  }

  if (resource === "logs" && action === "tail") {
    const nodeId = args[0];
    if (!nodeId) throw new Error("Usage: murmur logs tail <nodeId>");
    console.log(`Stub: tailing logs for node ${nodeId}`);
    return;
  }

  console.log(`MurMur CLI\n\nCommands:\n  murmur node spawn <name>\n  murmur node list\n  murmur logs tail <nodeId>`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
