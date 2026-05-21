import { z } from "zod";

export const ArchiveCreateSchema = z.object({
  project_id: z.string().uuid(),
  type: z.enum(["note", "business_audit", "conversation", "observation", "reflection", "signal_run"]),
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  emotional_tone: z.string().default("neutral"),
  metadata: z.record(z.any()).default({})
});
