// /events/ingest endpoint stores typed events.
import { Router } from "express";
import { z } from "zod";
import type { StudioEvent } from "@murmur/shared";
import { db } from "../core/store.js";

export const eventsRouter = Router();

const eventSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  timestamp: z.number(),
  type: z.enum(["pose", "audio", "midi", "agent_output", "fused_output"]),
  payload: z.record(z.any())
});

eventsRouter.post("/ingest", (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid event payload", details: parsed.error.flatten() });
  }

  const event = parsed.data as StudioEvent;
  db.events.push(event);
  return res.status(202).json({ accepted: true, eventId: event.id });
});
