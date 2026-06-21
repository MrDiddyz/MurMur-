import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const topologyPath = path.join(__dirname, 'topology.json');
const topology = JSON.parse(fs.readFileSync(topologyPath, 'utf8'));

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function checkBasicStructure(data) {
  if (!data || typeof data !== 'object') {
    fail('Topology must be a JSON object.');
    return false;
  }

  if (!Array.isArray(data.modules) || data.modules.length === 0) {
    fail('Topology must contain a non-empty modules array.');
    return false;
  }

  return true;
}

function detectCycle(modulesById) {
  const visited = new Set();
  const stack = new Set();

  function dfs(moduleId) {
    if (stack.has(moduleId)) {
      return true;
    }

    if (visited.has(moduleId)) {
      return false;
    }

    visited.add(moduleId);
    stack.add(moduleId);

    const moduleDef = modulesById.get(moduleId);
    for (const dep of moduleDef.dependsOn) {
      if (dfs(dep)) {
        return true;
      }
    }

    stack.delete(moduleId);
    return false;
  }

  for (const moduleId of modulesById.keys()) {
    if (dfs(moduleId)) {
      return true;
    }
  }

  return false;
}

if (checkBasicStructure(topology)) {
  const modulesById = new Map();

  for (const mod of topology.modules) {
    if (!mod.id || typeof mod.id !== 'string') {
      fail('Each module must include a string id.');
      continue;
    }

    if (!Array.isArray(mod.dependsOn)) {
      fail(`Module ${mod.id} must include dependsOn array.`);
      continue;
    }

    if (modulesById.has(mod.id)) {
      fail(`Duplicate module id found: ${mod.id}`);
      continue;
    }

    modulesById.set(mod.id, mod);
  }

  for (const [moduleId, mod] of modulesById.entries()) {
    for (const dep of mod.dependsOn) {
      if (!modulesById.has(dep)) {
        fail(`Module ${moduleId} depends on unknown module: ${dep}`);
      }
      if (dep === moduleId) {
        fail(`Module ${moduleId} cannot depend on itself.`);
      }
    }
  }

  if (detectCycle(modulesById)) {
    fail('Topology contains a dependency cycle.');
  }

  if (process.exitCode !== 1) {
    console.log(`✅ Topology invariants satisfied for ${modulesById.size} modules.`);
  }
}
