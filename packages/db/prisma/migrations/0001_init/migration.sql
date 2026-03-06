-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "maxIterations" INTEGER NOT NULL,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowEvent" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowCheckpoint" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowCheckpoint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkflowEvent_workflowId_idx" ON "WorkflowEvent"("workflowId");
CREATE INDEX "WorkflowCheckpoint_workflowId_step_idx" ON "WorkflowCheckpoint"("workflowId", "step");
CREATE INDEX "Memory_workflowId_idx" ON "Memory"("workflowId");

ALTER TABLE "WorkflowEvent" ADD CONSTRAINT "WorkflowEvent_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowCheckpoint" ADD CONSTRAINT "WorkflowCheckpoint_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
