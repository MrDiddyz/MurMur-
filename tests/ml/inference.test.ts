import test from "node:test";
import assert from "node:assert/strict";
import { selectHour } from "../../services/ml/inference.js";

test("epsilon exploration returns random hour when epsilon is 1", () => {
  const model = { predict: () => Array.from({ length: 24 }, (_, i) => i) };
  const chosen = new Set<number>();

  for (let i = 0; i < 80; i += 1) {
    chosen.add(selectHour(model, [0, 1, 2], 1));
  }

  assert.ok(chosen.size > 1);
});
