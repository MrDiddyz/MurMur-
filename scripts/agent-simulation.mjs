import fs from 'node:fs';
import path from 'node:path';

const tierOrder = { core: 1, guided: 2, professional: 3 };
const entitlementGate = {
  dashboard: 'core',
  learning: 'core',
  practiceLab: 'guided',
  community: 'core',
  certification: 'guided',
  ambassador: 'professional',
  admin: 'professional',
};

function hasEntitlement(tier, area) {
  return tierOrder[tier] >= tierOrder[entitlementGate[area]];
}

function resolveEntitlements(tier) {
  return Object.keys(entitlementGate).reduce((acc, key) => {
    acc[key] = hasEntitlement(tier, key);
    return acc;
  }, {});
}

function calculateProgressMetrics(progress, totalLessons) {
  const completedLessons = progress.filter((entry) => entry.completed).length;
  const completionPercentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const milestoneCount = Math.floor(completedLessons / 5);
  return { completedLessons, completionPercentage, milestoneCount };
}

function simulateMemberAccessAgents() {
  const scenarios = [
    { agent: 'core_member', tier: 'core' },
    { agent: 'guided_member', tier: 'guided' },
    { agent: 'professional_member', tier: 'professional' },
  ];

  const findings = [];

  for (const scenario of scenarios) {
    const map = resolveEntitlements(scenario.tier);

    if (scenario.tier === 'core' && (map.practiceLab || map.certification || map.ambassador || map.admin)) {
      findings.push(`[ACCESS] ${scenario.agent} has over-permissioned access.`);
    }

    if (scenario.tier === 'guided' && (!map.practiceLab || !map.certification || map.ambassador || map.admin)) {
      findings.push(`[ACCESS] ${scenario.agent} entitlement matrix mismatch.`);
    }

    if (scenario.tier === 'professional' && Object.values(map).some((value) => value !== true)) {
      findings.push(`[ACCESS] ${scenario.agent} expected full access but did not receive it.`);
    }
  }

  return findings;
}

function simulateProgressionAgents() {
  const findings = [];

  const lowProgress = calculateProgressMetrics(
    [
      { completed: true },
      { completed: true },
      { completed: false },
      { completed: false },
    ],
    20,
  );

  const highProgress = calculateProgressMetrics(
    Array.from({ length: 18 }, (_, index) => ({ completed: index < 16 })),
    18,
  );

  const certificationEligible = highProgress.completionPercentage >= 70 && highProgress.milestoneCount >= 3;

  if (lowProgress.completionPercentage >= 70) {
    findings.push('[PROGRESSION] Low-progress learner incorrectly qualifies as high completion.');
  }

  if (!certificationEligible) {
    findings.push('[PROGRESSION] High-progress learner did not qualify for certification threshold.');
  }

  return findings;
}

function simulateSchemaWeaknessAgent() {
  const findings = [];
  const schemaPath = path.join(process.cwd(), 'supabase/murmur_aicore_schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  if (sql.includes('create policy "levels_public_read" on public.levels for select using (true);')) {
    findings.push('[SCHEMA] levels_public_read uses `true` and exposes all levels regardless of publication status.');
  }

  if (sql.includes('create policy "modules_public_read" on public.modules for select using (true);')) {
    findings.push('[SCHEMA] modules_public_read uses `true` and exposes all modules regardless of publication status.');
  }

  if (sql.includes('create policy "lessons_public_read" on public.lessons for select using (true);')) {
    findings.push('[SCHEMA] lessons_public_read uses `true` and exposes all lessons regardless of publication status.');
  }

  const hasAdminBypassPolicy = sql.includes('service_role') || sql.includes('is_admin');
  if (!hasAdminBypassPolicy) {
    findings.push('[SCHEMA] No explicit admin/service-role policy helpers found for moderation workflows.');
  }

  return findings;
}

function main() {
  const findings = [
    ...simulateMemberAccessAgents(),
    ...simulateProgressionAgents(),
    ...simulateSchemaWeaknessAgent(),
  ];

  console.log('MurMurAiCore agent simulation report');
  console.log('=================================');

  if (findings.length === 0) {
    console.log('No weaknesses detected in simulated scenarios.');
    process.exit(0);
  }

  findings.forEach((finding, index) => {
    console.log(`${index + 1}. ${finding}`);
  });

  console.log('\nResult: weaknesses detected. Review recommended before production rollout.');
  process.exit(1);
}

main();
