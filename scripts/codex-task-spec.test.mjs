import test from 'node:test';
import assert from 'node:assert/strict';

import {
  convertProposalToCodexTask,
  deriveConstraints,
  mapModule,
} from './codex-task-spec.mjs';

test('mapModule maps known and unknown modules', () => {
  assert.equal(mapModule('billing'), 'backend/billing');
  assert.equal(mapModule('unknown'), 'backend');
});

test('deriveConstraints uses module-specific and fallback constraints', () => {
  assert.equal(
    deriveConstraints({ module: 'billing' }),
    'No modification to Stripe core payment API',
  );
  assert.equal(
    deriveConstraints({ module: 'rl' }),
    'Do not alter reward baseline without Operator approval',
  );
  assert.equal(
    deriveConstraints({ module: 'frontend' }),
    'Follow repository modular standards',
  );
});

test('convertProposalToCodexTask creates the expected payload shape', () => {
  const proposal = {
    id: 'prop-123',
    module: 'scheduler',
    proposed_solution: 'Add retry queue to cron pipeline',
  };

  assert.deepEqual(convertProposalToCodexTask(proposal), {
    task_type: 'feature',
    target_module: 'backend/scheduler',
    objective: 'Add retry queue to cron pipeline',
    constraints: 'Follow repository modular standards',
    test_required: true,
    auto_generated: true,
    proposal_id: 'prop-123',
  });
});
