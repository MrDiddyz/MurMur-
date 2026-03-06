import { z } from "zod";

export const WorkflowStatusSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled"
]);
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;

export const CreateWorkflowSchema = z.object({
  prompt: z.string().min(1),
  maxIterations: z.number().int().min(1).max(10).default(3)
});

export const WorkflowEventSchema = z.object({
  workflowId: z.string(),
  type: z.string(),
  message: z.string(),
  payload: z.unknown().optional(),
  createdAt: z.string().datetime().optional()
});
export type WorkflowEvent = z.infer<typeof WorkflowEventSchema>;

export const RunWorkflowRequestSchema = z.object({
  workflowId: z.string(),
  prompt: z.string(),
  maxIterations: z.number().int().min(1).max(10)
});

export const RunWorkflowResponseSchema = z.object({
  status: WorkflowStatusSchema,
  checkpoints: z.array(z.object({ step: z.string(), summary: z.string() })),
  events: z.array(WorkflowEventSchema),
  result: z.object({ output: z.string() }).nullable()
});

export const env = {
  apiPort: Number(process.env.API_PORT ?? 10000),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  dbUrl: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/murmur",
  orchestratorUrl: process.env.ORCHESTRATOR_URL ?? "http://localhost:4002",
  internalApiKey: process.env.INTERNAL_API_KEY ?? "dev-internal-key"
};

export type WorkflowGraphEvent = { type: string; message: string };

export type WorkflowState = {
  workflowId: string;
  prompt: string;
  maxIterations: number;
  iteration: number;
  plan: string[];
  buildOutput: string;
  approved: boolean;
  feedback: string;
  optimizedOutput: string;
  events: WorkflowGraphEvent[];
};
