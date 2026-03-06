import { PrismaClient } from "@prisma/client";
import type { WorkflowStatus } from "@murmur/shared";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const workflowRepository = {
  createWorkflow(input: { prompt: string; metadata?: Record<string, unknown> }) {
    return prisma.workflow.create({
      data: { prompt: input.prompt, metadata: input.metadata, status: "queued" }
    });
  },
  getWorkflow(id: string) {
    return prisma.workflow.findUnique({ where: { id } });
  },
  updateStatus(id: string, status: WorkflowStatus, error?: string | null) {
    return prisma.workflow.update({ where: { id }, data: { status, error } });
  },
  saveResult(id: string, result: unknown) {
    return prisma.workflow.update({ where: { id }, data: { result, status: "completed" } });
  },
  appendEvent(input: {
    workflowId: string;
    type: string;
    message: string;
    payload?: unknown;
  }) {
    return prisma.workflowEvent.create({ data: input });
  },
  listEvents(workflowId: string) {
    return prisma.workflowEvent.findMany({ where: { workflowId }, orderBy: { createdAt: "asc" } });
  },
  saveCheckpoint(input: { workflowId: string; node: string; state: unknown }) {
    return prisma.workflowCheckpoint.create({ data: input });
  }
};

export const memoryRepository = {
  createMemory(input: {
    workflowId: string;
    content: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }) {
    return prisma.memory.create({
      data: { ...input, tags: input.tags ?? [] }
    });
  },
  getByWorkflowId(workflowId: string) {
    return prisma.memory.findMany({ where: { workflowId }, orderBy: { createdAt: "desc" } });
  },
  searchMemories(query: string) {
    return prisma.memory.findMany({
      where: { content: { contains: query, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }
};
