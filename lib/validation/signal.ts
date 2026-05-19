import { z } from "zod";

export const signalAnalyzeSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.string().min(1),
  projectId: z.string().uuid()
});
