import { z } from "zod";

export const SignalInputSchema = z.object({ title: z.string(), content: z.string(), type: z.string(), projectId: z.string().uuid() });
export const SignalOutputSchema = z.object({
  core_signal: z.string(), hidden_risks: z.array(z.string()), opportunities: z.array(z.string()), emotional_tone: z.string(),
  business_value: z.string(), clarity_score: z.number().min(0).max(100), next_actions: z.array(z.string())
});
