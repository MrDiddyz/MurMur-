import { z } from 'zod';

export const auditInputSchema = z.object({
  businessName: z.string().min(2).max(120),
  website: z.string().url().max(240),
  industry: z.string().min(2).max(120),
  notes: z.string().max(1800).optional().default('')
});

export const auditReportSchema = z.object({
  executiveSummary: z.string(),
  observations: z.array(z.string()).min(4).max(8),
  narrative: z.string(),
  signalLeaks: z.array(z.object({
    title: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    impact: z.string()
  })).min(3).max(6),
  recommendations: z.array(z.object({
    title: z.string(),
    detail: z.string(),
    priority: z.enum(['low', 'medium', 'high'])
  })).min(4).max(8),
  score: z.object({
    overall: z.number().int().min(0).max(100),
    visibility: z.number().int().min(0).max(100),
    trust: z.number().int().min(0).max(100),
    conversion: z.number().int().min(0).max(100),
    consistency: z.number().int().min(0).max(100)
  }),
  sevenDayActionPlan: z.array(z.object({
    day: z.number().int().min(1).max(7),
    action: z.string(),
    outcome: z.string()
  })).length(7)
});
