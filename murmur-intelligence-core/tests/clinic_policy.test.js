const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { validateNoClaimWithoutEvidence } = require('../scripts/clinic_policy');

const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

test('passes for compliant clinic router artifact', () => {
  const compliant = readJson('knowledge-base/clinic-ai-knowledge-router.sandra-constance.nb-NO.json');
  const errors = validateNoClaimWithoutEvidence(compliant);

  assert.equal(errors.length, 0, 'expected zero policy violations for compliant artifact');
});

test('fails for violating sample and matches golden paths', () => {
  const violating = readJson('tests/fixtures/clinic-router.violates-no-claim-without-evidence.json');
  const golden = readJson('artifacts/policy/no-claim-without-evidence.golden.json');

  const errors = validateNoClaimWithoutEvidence(violating);
  assert.equal(errors.length, 2, 'expected two policy violations');

  const reduced = errors.map(({ path, message }) => ({ path, message }));
  assert.deepEqual(reduced, golden);
});
