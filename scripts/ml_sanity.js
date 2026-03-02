function fail(message) {
  throw new Error(message);
}

function ensureBoundedRewards(rewards) {
  for (const reward of rewards) {
    if (Number.isNaN(reward)) fail("Reward contains NaN");
    if (reward < 0 || reward > 1) fail(`Reward out of [0,1]: ${reward}`);
  }
}

function ensurePositiveParams(alpha, beta) {
  if (!(alpha > 0)) fail(`alpha must be > 0, got ${alpha}`);
  if (!(beta > 0)) fail(`beta must be > 0, got ${beta}`);
}

function ensureDqnShape(vector, expectedLength = 24) {
  if (vector.length !== expectedLength) {
    fail(`DQN output length expected ${expectedLength}, got ${vector.length}`);
  }
  if (vector.some((value) => Number.isNaN(value))) {
    fail("DQN output contains NaN");
  }
}

function sampleReplayBuffer(buffer, size) {
  if (buffer.length < size) fail(`Replay buffer underfilled: have ${buffer.length}, need ${size}`);
  const output = [];
  for (let i = 0; i < size; i += 1) {
    output.push(buffer[Math.floor(Math.random() * buffer.length)]);
  }
  return output;
}

function main() {
  ensureBoundedRewards([0, 0.25, 0.5, 0.75, 1]);
  ensurePositiveParams(1, 1);
  ensureDqnShape(Array.from({ length: 24 }, (_, index) => index / 24));

  const replayBuffer = Array.from({ length: 64 }, (_, i) => ({ state: i, reward: Math.min(1, i / 64) }));
  const batch = sampleReplayBuffer(replayBuffer, 16);
  if (batch.length !== 16) fail("Replay buffer sampling returned wrong batch size");

  console.log("[verify:ml] PASS");
}

try {
  main();
} catch (error) {
  console.error("[verify:ml] FAIL:", error instanceof Error ? error.message : error);
  process.exit(1);
}
