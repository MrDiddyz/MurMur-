-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed roles
INSERT INTO "Role" ("id", "name") VALUES
('role_operator', 'operator'),
('role_architect', 'architect'),
('role_a7', 'a7')
ON CONFLICT ("name") DO NOTHING;

-- Seed permissions
INSERT INTO "Permission" ("id", "action") VALUES
('perm_node_create', 'node:create'),
('perm_node_list', 'node:list'),
('perm_node_status_update', 'node:status:update'),
('perm_session_spawn_operator', 'session:spawn:operator'),
('perm_session_spawn_admin', 'session:spawn:admin')
ON CONFLICT ("action") DO NOTHING;

-- Role -> permission mapping
INSERT INTO "RolePermission" ("roleId", "permissionId") VALUES
('role_operator', 'perm_node_create'),
('role_operator', 'perm_node_list'),
('role_operator', 'perm_session_spawn_operator'),
('role_architect', 'perm_node_create'),
('role_architect', 'perm_node_list'),
('role_architect', 'perm_node_status_update'),
('role_architect', 'perm_session_spawn_admin'),
('role_a7', 'perm_node_create'),
('role_a7', 'perm_node_list'),
('role_a7', 'perm_node_status_update'),
('role_a7', 'perm_session_spawn_admin')
ON CONFLICT DO NOTHING;
