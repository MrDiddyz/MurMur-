// /motion/fuse endpoint fuses outputs and returns planned frame.
import { Router } from "express";
import type { AgentResult, StudioMode } from "@murmur/shared";
import { fuseAndPlan } from "../core/runtime.js";

export const motionRouter = Router();

motionRouter.post("/fuse", async (req, res) => {
  const { sessionId, mode, outputs } = req.body as {
    sessionId: string;
    mode: StudioMode;
    outputs: AgentResult[];
  };
  const result = await fuseAndPlan(sessionId, mode, outputs);
  res.json(result);
});
