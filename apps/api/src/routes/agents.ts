// /agents/evaluate endpoint runs eligible modular agents.
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { z } from "zod";
import type { AgentInput } from "@murmur/shared";
import { evaluateAgents } from "../core/runtime.js";

export const agentsRouter: ExpressRouter = Router();

const agentInputSchema = z.object({
  sessionId: z.string().min(1),
  mode: z.enum(["ID", "MIRROR", "FREE", "PERFORMANCE_SYNC"]),
  events: z.array(z.unknown()).default([]),
});

agentsRouter.post("/evaluate", async (req, res) => {
  const parsed = agentInputSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid evaluation payload", details: parsed.error.flatten() });
  }

  const input = parsed.data as AgentInput;
  const outputs = await evaluateAgents(input);
  return res.json({ outputs });
});
