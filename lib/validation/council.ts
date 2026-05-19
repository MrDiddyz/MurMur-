import { z } from "zod";

export const councilRunSchema = z.object({
  context: z.string().min(1),
  projectId: z.string().uuid()
});
