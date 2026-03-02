import test from "node:test";
import assert from "node:assert/strict";
import { DqnModel } from "../../services/ml/dqnModel.js";

test("DQN forward pass returns 24 Q-values", () => {
  const model = new DqnModel({ inputSize: 5, outputSize: 24 });
  const qValues = model.predict([0.2, 0.4, 0.1, 0.9, 0.3]);

  assert.equal(qValues.length, 24);
  assert.ok(qValues.every((q) => Number.isFinite(q)));
});
