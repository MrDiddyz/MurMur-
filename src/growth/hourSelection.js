import { DqnTrainer } from "../../services/ml/trainer.js";
import { selectHour as selectHourDqn } from "../../services/ml/inference.js";

const DEFAULT_BATCH_SIZE = Number(process.env.ML_BATCH_SIZE ?? 32);
const DEFAULT_TRAIN_INTERVAL = Number(process.env.ML_TRAIN_INTERVAL ?? 10);
const DEFAULT_EPSILON = Number(process.env.ML_EPSILON ?? 0.1);
const ML_ENABLED = String(process.env.ML_ENABLED ?? "false").toLowerCase() === "true";

class BanditHourSelector {
  constructor() {
    this.counts = Array(24).fill(0);
    this.rewards = Array(24).fill(0);
  }

  selectHour() {
    for (let i = 0; i < 24; i += 1) {
      if (this.counts[i] === 0) return i;
    }

    let bestHour = 0;
    let bestAvg = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < 24; i += 1) {
      const avg = this.rewards[i] / this.counts[i];
      if (avg > bestAvg) {
        bestAvg = avg;
        bestHour = i;
      }
    }

    return bestHour;
  }

  observe(action, reward) {
    this.counts[action] += 1;
    this.rewards[action] += reward;
  }
}

const banditByAccount = new Map();
const trainerByAccount = new Map();

function getBandit(accountId) {
  if (!banditByAccount.has(accountId)) {
    banditByAccount.set(accountId, new BanditHourSelector());
  }
  return banditByAccount.get(accountId);
}

async function getTrainer(accountId, inputSize) {
  if (!trainerByAccount.has(accountId)) {
    const trainer = new DqnTrainer({
      accountId,
      inputSize,
      batchSize: DEFAULT_BATCH_SIZE,
      trainInterval: DEFAULT_TRAIN_INTERVAL,
    });
    await trainer.init();
    trainerByAccount.set(accountId, trainer);
  }

  return trainerByAccount.get(accountId);
}

export async function selectHour({ accountId = "default", state = [] } = {}) {
  if (!ML_ENABLED) {
    return getBandit(accountId).selectHour();
  }

  const trainer = await getTrainer(accountId, state.length || 1);
  return selectHourDqn(trainer.model, state, DEFAULT_EPSILON);
}

export async function observeHourOutcome({
  accountId = "default",
  state = [],
  action,
  reward = 0,
  nextState = state,
  done = false,
} = {}) {
  const bandit = getBandit(accountId);
  bandit.observe(action, reward);

  if (!ML_ENABLED) {
    return { trained: false, loss: null, mode: "bandit" };
  }

  const trainer = await getTrainer(accountId, state.length || 1);
  const result = await trainer.observe({ state, action, reward, nextState, done });
  return { ...result, mode: "dqn" };
}
