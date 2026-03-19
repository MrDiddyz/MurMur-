// API bootstrap with REST routes + websocket stream for agent output.
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { sessionsRouter } from "./routes/sessions.js";
import { eventsRouter } from "./routes/events.js";
import { agentsRouter } from "./routes/agents.js";
import { motionRouter } from "./routes/motion.js";
import { profilesRouter } from "./routes/profiles.js";
import { healthRouter } from "./routes/health.js";
import { broadcast, evaluateAgents } from "./core/runtime.js";
import { db } from "./core/store.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/sessions", sessionsRouter);
app.use("/events", eventsRouter);
app.use("/agents", agentsRouter);
app.use("/motion", motionRouter);
app.use("/profiles", profilesRouter);
app.use("/health", healthRouter);

const server = createServer(app);
const ws = new WebSocketServer({ server, path: "/ws" });

const ticker = setInterval(async () => {
  if (ws.clients.size === 0 || db.sessions.size === 0) return;

  const [session] = [...db.sessions.values()];
  if (!session) return;

  const sessionEvents = db.events.filter((event) => event.sessionId === session.id).slice(-12);
  if (sessionEvents.length === 0) return;

  const outputs = await evaluateAgents({
    sessionId: session.id,
    mode: session.mode,
    events: sessionEvents
  });

  broadcast(ws, { type: "agent-output", sessionId: session.id, outputs, ts: Date.now() });
}, 1000);

server.on("close", () => clearInterval(ticker));

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  console.log(`MurMur API listening on http://localhost:${port}`);
});
