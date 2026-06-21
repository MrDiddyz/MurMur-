import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const profile = process.env.TIKTOK_PROFILE || "@murmur_artist_001";

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureJson(pathname) {
  if (!fs.existsSync(pathname)) {
    throw new Error(`Missing required output: ${pathname}`);
  }

  JSON.parse(fs.readFileSync(pathname, "utf8"));
}

run("npm", ["run", "build"]);
run("node", ["dist/index.js", "--profile", profile]);
run("npm", ["run", "test"]);

const snippetPath = path.join(root, "data", "snippets", "neon_addiction.snippets.json");
const metricsPath = path.join(root, "data", "metrics", "snippet_metrics.json");

ensureJson(snippetPath);
ensureJson(metricsPath);

console.log(`Redeploy completed for ${profile}`);
