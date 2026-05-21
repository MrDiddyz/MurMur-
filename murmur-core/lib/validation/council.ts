import { z } from "zod";
export const CouncilAgentSchema = z.object({ agent: z.string(), perspective: z.string(), score: z.number().min(0).max(100), risk: z.string(), opportunity: z.string(), recommendation: z.string() });
export const CouncilOutputSchema = z.object({ summary: z.string(), priority_score: z.number().min(0).max(100), main_risk: z.string(), main_opportunity: z.string(), recommended_next_step: z.string() });
