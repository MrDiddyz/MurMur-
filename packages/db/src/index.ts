import { PrismaClient } from "@prisma/client";
import type { WorkflowStatus } from "@murmur/shared";

export const prisma = new PrismaClient();

export async function createWorkflow(input: { prompt: string; maxIterations: number }) {
  return prisma.workflow.create({ data: { ...input, status: "queued" } });
}

export async function getWorkflowById(id: string) {
  return prisma.workflow.findUnique({ where: { id } });
}

export async function listWorkflowEvents(workflowId: string) {
  return prisma.workflowEvent.findMany({ where: { workflowId }, orderBy: { createdAt: "asc" } });
}

export async function updateWorkflowStatus(workflowId: string, status: WorkflowStatus) {
  return prisma.workflow.update({ where: { id: workflowId }, data: { status } });
}

export async function appendWorkflowEvent(input: { workflowId: string; type: string; message: string; payload?: unknown }) {
  return prisma.workflowEvent.create({ data: input });
}

export async function saveWorkflowCheckpoint(input: { workflowId: string; step: string; data: unknown }) {
  return prisma.workflowCheckpoint.create({ data: input as { workflowId: string; step: string; data: object } });
}

export async function getWorkflowCheckpoint(workflowId: string, step: string) {
  return prisma.workflowCheckpoint.findFirst({ where: { workflowId, step }, orderBy: { createdAt: "desc" } });
}

export async function saveWorkflowResult(workflowId: string, output: string) {
  return prisma.workflow.update({ where: { id: workflowId }, data: { result: output } });
}

export async function createMemory(input: { workflowId: string; content: string; tags?: string[] }) {
  return prisma.memory.create({ data: { ...input, tags: input.tags ?? [] } });
}

export async function getMemoriesByWorkflowId(workflowId: string) {
  return prisma.memory.findMany({ where: { workflowId }, orderBy: { createdAt: "desc" } });
}

export async function searchMemories(query: string) {
  return prisma.memory.findMany({ where: { content: { contains: query, mode: "insensitive" } }, orderBy: { createdAt: "desc" } });
}

export async function listWorkflowCheckpoints(workflowId: string) {
  return prisma.workflowCheckpoint.findMany({ where: { workflowId }, orderBy: { createdAt: "asc" } });
}
