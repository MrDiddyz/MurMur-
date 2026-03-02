import path from "node:path";
import { DqnModel } from "./dqnModel.js";
import { ReplayBuffer } from "./replayBuffer.js";

export class DqnTrainer {
  constructor({
    accountId,
    inputSize,
    batchSize = 32,
    trainInterval = 10,
    gamma = 0.95,
    replayMaxSize = 10000,
    modelDir = "data/models",
  }) {
    this.accountId = accountId;
    this.batchSize = batchSize;
    this.trainInterval = trainInterval;
    this.gamma = gamma;
    this.modelPath = path.join(modelDir, `account_${accountId}.json`);
    this.replayBuffer = new ReplayBuffer(replayMaxSize);
    this.model = new DqnModel({ inputSize });
    this.experienceCount = 0;
  }

  async init() {
    this.model = await DqnModel.load(this.modelPath, { inputSize: this.model.inputSize });
  }

  async observe(experience) {
    this.replayBuffer.add(experience);
    this.experienceCount += 1;

    if (this.experienceCount % this.trainInterval === 0 && this.replayBuffer.length >= this.batchSize) {
      const batch = this.replayBuffer.sample(this.batchSize);
      const loss = this.model.trainBatch(batch, this.gamma);
      await this.model.save(this.modelPath);
      return { trained: true, loss };
    }

    return { trained: false, loss: null };
  }
}
