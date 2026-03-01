#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const [, , task] = process.argv;

if (!task) {
  console.error("Usage: turbo <task>");
  process.exit(1);
}

const validTasks = new Set(["dev", "build", "lint", "typecheck", "test"]);
if (!validTasks.has(task)) {
  console.error(`Unsupported task: ${task}`);
  process.exit(1);
}

const args = ["run", "--workspaces", "--if-present", task];

if (task === "dev") {
  args.push("--parallel");
}

const result = spawnSync("npm", args, {
  stdio: "inherit",
  env: process.env
});

process.exit(result.status ?? 1);
