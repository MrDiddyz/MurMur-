// /motion/fuse endpoint fuses outputs and returns planned frame.
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { z } from "zod";
import type { AgentResult, StudioMode } from "@murmur/shared";
import { fuseAndPlan } from "../core/runtime.js";

export const motionRouter: ExpressRouter = Router();

const fuseRequestSchema = z.object({
  sessionId: z.string().min(1),
  mode: z.enum(["ID", "MIRROR", "FREE", "PERFORMANCE_SYNC"]),
  outputs: z.array(z.unknown()),
});

motionRouter.post("/fuse", async (req, res) => {
  const parsed = fuseRequestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid fuse payload", details: parsed.error.flatten() });
  }

  const { sessionId, mode, outputs } = parsed.data as {
    sessionId: string;
    mode: StudioMode;
    outputs: AgentResult[];
  };
  const result = await fuseAndPlan(sessionId, mode, outputs);
  return res.json(result);
});
