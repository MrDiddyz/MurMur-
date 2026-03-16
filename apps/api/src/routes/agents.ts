// /agents/evaluate endpoint runs eligible modular agents.
import { Router } from "express";
import type { AgentInput } from "@murmur/shared";
import { evaluateAgents } from "../core/runtime.js";

export const agentsRouter = Router();

agentsRouter.post("/evaluate", async (req, res) => {
  const input = req.body as AgentInput;
  const outputs = await evaluateAgents(input);
  res.json({ outputs });
});
