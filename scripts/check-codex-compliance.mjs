#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const rulesetPath = resolve(repoRoot, 'docs/CODEX_RULESET.md');

const allowedExtensions = new Set([
  '.cjs',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

const ignoredPathPatterns = [
  /^\.git\//,
  /(^|\/)node_modules\//,
  /(^|\/)\.next\//,
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /(^|\/)coverage\//,
  /(^|\/)package-lock\.json$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)yarn\.lock$/,
  /^scripts\/check-codex-compliance\.mjs$/,
];

const requiredRulesetSnippets = [
  'One layer at a time',
  'No product sprawl',
  'No renaming core concepts',
  'Next.js App Router',
  'TypeScript',
  'Tailwind CSS',
  'Supabase',
  'Vercel',
  'Zod',
  'Input',
  'Council',
  'Orchestration',
  'Report',
  'Follow-up',
  'Learning Loop',
  'MurMur Trust Scan',
  'Files changed',
  'Implementation summary',
  'Test steps',
  'Environment variables',
  'Known limitations',
  'Next recommended lag',
];

const responseContract = [
  { name: 'Files changed', patterns: [/files changed/i] },
  { name: 'Implementation summary', patterns: [/implementation summary/i, /what was implemented/i] },
  { name: 'Test steps', patterns: [/test steps/i, /how to test/i, /testing/i] },
  { name: 'Environment variables', patterns: [/environment variables/i, /env vars/i] },
  { name: 'Known limitations', patterns: [/known limitations/i, /limitations/i] },
  { name: 'Next recommended lag', patterns: [/next recommended lag/i, /next lag/i] },
];

const driftRules = [
  {
    category: 'approved stack',
    pattern: /\b(React Router|Next\.js Pages Router|Pages Router|Vue|Nuxt|Angular|SvelteKit|Remix|Astro)\b/gi,
    guidance: 'Use the approved frontend stack: Next.js App Router, TypeScript, and Tailwind CSS.',
  },
  {
    category: 'approved stack',
    pattern: /\b(Firebase|Firestore|AWS Amplify|PlanetScale|Neon|Prisma)\b/gi,
    guidance: 'Use Supabase for the default data/backend path unless an exception is approved.',
  },
  {
    category: 'approved stack',
    pattern: /\b(Netlify|Cloudflare Pages|AWS Amplify Hosting)\b/gi,
    guidance: 'Use Vercel as the default deployment target unless an exception is approved.',
  },
  {
    category: 'approved stack',
    pattern: /\b(Yup|Joi|Valibot|Superstruct)\b/gi,
    guidance: 'Use Zod for validation unless an exception is approved.',
  },
  {
    category: 'core terminology',
    pattern: /\b(advisory board|expert board|expert panel|decision committee|AI committee)\b/gi,
    guidance: 'Use the canonical MurMur term "Council".',
  },
  {
    category: 'core terminology',
    pattern: /\b(decision pipeline|workflow engine|routing engine)\b/gi,
    guidance: 'Use the canonical MurMur term "Orchestration" when describing that loop stage.',
  },
  {
    category: 'commercial focus',
    pattern: /\b(first product|initial product|commercial product)\b(?![^\n]{0,80}\bMurMur Trust Scan\b)/gi,
    guidance: 'Name the first commercial product explicitly as "MurMur Trust Scan".',
  },
];

function parseArgs(argv) {
  const options = {
    changedRange: null,
    responseFiles: [],
    targets: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--changed') {
      options.changedRange = argv[index + 1] ?? 'HEAD~1...HEAD';
      index += 1;
    } else if (arg === '--response-file') {
      const responseFile = argv[index + 1];
      if (!responseFile) {
        throw new Error('--response-file requires a file path');
      }
      options.responseFiles.push(responseFile);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      options.targets.push(arg);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/check-codex-compliance.mjs [--changed <git-range>] [--response-file <file>] [files...]

Checks docs/CODEX_RULESET.md for required MurMur rules, scans target files for stack/terminology drift, and optionally validates a Codex delivery/PR body against the required response contract.

Examples:
  node scripts/check-codex-compliance.mjs
  node scripts/check-codex-compliance.mjs --changed origin/main...HEAD
  node scripts/check-codex-compliance.mjs --response-file /tmp/pr-body.md docs/CODEX_RULESET.md`);
}

function gitChangedFiles(range) {
  const result = spawnSync('git', ['diff', '--name-only', '--diff-filter=ACMRT', range], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(`Unable to collect changed files for range "${range}": ${result.stderr.trim()}`);
  }

  return result.stdout
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeRepoPath(path) {
  const absolutePath = resolve(repoRoot, path);
  return relative(repoRoot, absolutePath).replaceAll('\\', '/');
}

function isScannable(path) {
  const repoPath = normalizeRepoPath(path);

  if (ignoredPathPatterns.some((pattern) => pattern.test(repoPath))) {
    return false;
  }

  const absolutePath = resolve(repoRoot, repoPath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    return false;
  }

  return allowedExtensions.has(extname(repoPath));
}

function readRepoFile(path) {
  return readFileSync(resolve(repoRoot, normalizeRepoPath(path)), 'utf8');
}

function checkRuleset(violations) {
  if (!existsSync(rulesetPath)) {
    violations.push('Missing docs/CODEX_RULESET.md.');
    return;
  }

  const ruleset = readFileSync(rulesetPath, 'utf8');
  for (const snippet of requiredRulesetSnippets) {
    if (!ruleset.includes(snippet)) {
      violations.push(`docs/CODEX_RULESET.md is missing required ruleset text: "${snippet}".`);
    }
  }
}

function checkResponseContract(responseFile, violations) {
  if (!existsSync(responseFile)) {
    violations.push(`Response file not found: ${responseFile}.`);
    return;
  }

  const content = readFileSync(responseFile, 'utf8').trim();
  if (content.length === 0) {
    violations.push(`Response file is empty and cannot satisfy the Codex response contract: ${responseFile}.`);
    return;
  }

  for (const requirement of responseContract) {
    if (!requirement.patterns.some((pattern) => pattern.test(content))) {
      violations.push(`Response file ${responseFile} is missing required section: ${requirement.name}.`);
    }
  }
}

function lineForIndex(content, index) {
  return content.slice(0, index).split('\n').length;
}

function checkDrift(targets, violations) {
  for (const target of targets.filter(isScannable)) {
    const repoPath = normalizeRepoPath(target);
    const content = readRepoFile(repoPath);

    for (const rule of driftRules) {
      for (const match of content.matchAll(rule.pattern)) {
        violations.push(
          `${repoPath}:${lineForIndex(content, match.index ?? 0)} flags ${rule.category} drift on "${match[0]}". ${rule.guidance}`,
        );
      }
    }
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const violations = [];

  checkRuleset(violations);

  for (const responseFile of options.responseFiles) {
    checkResponseContract(responseFile, violations);
  }

  const targets = options.changedRange
    ? gitChangedFiles(options.changedRange)
    : options.targets.length > 0
      ? options.targets
      : ['docs/CODEX_RULESET.md'];

  checkDrift(targets, violations);

  if (violations.length > 0) {
    console.error('Codex compliance check failed:');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log('Codex compliance check passed.');
}

main();
