import test from "node:test";
import assert from "node:assert/strict";
import { ReplayBuffer } from "../../services/ml/replayBuffer.js";

test("ReplayBuffer respects max size and inserts latest experiences", () => {
  const buffer = new ReplayBuffer(2);
  buffer.add({ state: [0], action: 0, reward: 1, nextState: [1], done: false });
  buffer.add({ state: [1], action: 1, reward: 2, nextState: [2], done: false });
  buffer.add({ state: [2], action: 2, reward: 3, nextState: [3], done: true });

  assert.equal(buffer.length, 2);
  assert.deepEqual(buffer.buffer[0].state, [1]);
  assert.deepEqual(buffer.buffer[1].state, [2]);
});
