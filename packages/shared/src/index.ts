import { z } from "zod";

export const WorkflowStatusSchema = z.enum([
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled"
]);

export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;

export const CreateWorkflowInputSchema = z.object({
  prompt: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const WorkflowEventSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  type: z.string(),
  message: z.string(),
  payload: z.unknown().optional(),
  createdAt: z.string()
});

export const WorkflowResultSchema = z.object({
  workflowId: z.string(),
  output: z.unknown(),
  summary: z.string().optional()
});

export const WorkflowSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  status: WorkflowStatusSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  result: z.unknown().optional(),
  error: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type CreateWorkflowInput = z.infer<typeof CreateWorkflowInputSchema>;
export type WorkflowEventDto = z.infer<typeof WorkflowEventSchema>;
export type WorkflowResultDto = z.infer<typeof WorkflowResultSchema>;
export type WorkflowDto = z.infer<typeof WorkflowSchema>;

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  INTERNAL_API_KEY: z.string().min(1)
});

export const QUEUE_NAMES = {
  WORKFLOWS: "workflow-jobs"
} as const;
