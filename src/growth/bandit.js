const DEFAULT_ALPHA = 1;
const DEFAULT_BETA = 1;
const EXPLORATION_TRIAL_THRESHOLD = 5;
const HOURS_PER_DAY = 24;

function randomNormal() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sampleGamma(shape) {
  if (shape <= 0) {
    throw new Error("shape must be > 0");
  }

  if (shape < 1) {
    const u = Math.random();
    return sampleGamma(shape + 1) * Math.pow(u, 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    const x = randomNormal();
    const v = Math.pow(1 + c * x, 3);

    if (v <= 0) {
      continue;
    }

    const u = Math.random();
    if (u < 1 - 0.0331 * Math.pow(x, 4)) {
      return d * v;
    }

    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
}

export function sampleBeta(alpha, beta) {
  const x = sampleGamma(alpha);
  const y = sampleGamma(beta);
  return x / (x + y);
}

function clampReward(reward) {
  const numericReward = Number(reward);
  if (!Number.isFinite(numericReward)) {
    return 0;
  }

  return Math.max(0, Math.min(1, numericReward));
}

function buildDefaultArms(accountId) {
  return Array.from({ length: HOURS_PER_DAY }, (_, hourSlot) => ({
    id: `${accountId}:${hourSlot}`,
    account_id: accountId,
    hour_slot: hourSlot,
    alpha: DEFAULT_ALPHA,
    beta: DEFAULT_BETA,
    total_trials: 0,
    total_reward: 0,
    created_at: new Date().toISOString(),
  }));
}

export class InMemoryBanditStore {
  constructor() {
    this.armsByAccount = new Map();
  }

  getOrCreateArms(accountId) {
    if (!this.armsByAccount.has(accountId)) {
      this.armsByAccount.set(accountId, buildDefaultArms(accountId));
    }

    return this.armsByAccount.get(accountId);
  }

  updateArm(accountId, hourSlot, reward) {
    const arms = this.getOrCreateArms(accountId);
    const arm = arms.find((item) => item.hour_slot === hourSlot);

    if (!arm) {
      throw new Error(`arm not found for hour slot ${hourSlot}`);
    }

    const boundedReward = clampReward(reward);
    arm.alpha += boundedReward;
    arm.beta += 1 - boundedReward;
    arm.total_trials += 1;
    arm.total_reward += boundedReward;

    return arm;
  }
}

export class BanditService {
  constructor(store = new InMemoryBanditStore()) {
    this.store = store;
  }

  getArms(accountId) {
    return this.store.getOrCreateArms(accountId);
  }

  selectHour(accountId, randomFn = Math.random) {
    const arms = this.store.getOrCreateArms(accountId);

    const requiresExploration = arms.some((arm) => arm.total_trials < EXPLORATION_TRIAL_THRESHOLD);
    if (requiresExploration) {
      const underExplored = arms.filter((arm) => arm.total_trials < EXPLORATION_TRIAL_THRESHOLD);
      const selectedIndex = Math.floor(randomFn() * underExplored.length);
      return underExplored[selectedIndex].hour_slot;
    }

    let selectedHour = arms[0].hour_slot;
    let bestSample = -Infinity;

    for (const arm of arms) {
      const sampledReward = sampleBeta(arm.alpha, arm.beta);
      if (sampledReward > bestSample) {
        bestSample = sampledReward;
        selectedHour = arm.hour_slot;
      }
    }

    return selectedHour;
  }

  updateArm(accountId, hourSlot, reward) {
    return this.store.updateArm(accountId, hourSlot, reward);
  }

  getArmStats(accountId) {
    return this.store.getOrCreateArms(accountId).map((arm) => ({
      ...arm,
      expected_mean: arm.alpha / (arm.alpha + arm.beta),
    }));
  }
}

export function calculateReward({ normalizedViews = 0, normalizedLikes = 0, normalizedWatchTime = 0 }) {
  const reward =
    0.4 * clampReward(normalizedViews) +
    0.3 * clampReward(normalizedLikes) +
    0.3 * clampReward(normalizedWatchTime);

  return clampReward(reward);
}
