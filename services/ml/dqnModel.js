import { promises as fs } from "node:fs";
import path from "node:path";

function randn(scale = 0.1) {
  return (Math.random() * 2 - 1) * scale;
}

function zeros(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function relu(v) {
  return v.map((x) => (x > 0 ? x : 0));
}

function reluGrad(v) {
  return v.map((x) => (x > 0 ? 1 : 0));
}

function matVecMul(mat, vec, bias) {
  const out = new Array(mat.length).fill(0);
  for (let i = 0; i < mat.length; i += 1) {
    let sum = bias ? bias[i] : 0;
    const row = mat[i];
    for (let j = 0; j < row.length; j += 1) {
      sum += row[j] * vec[j];
    }
    out[i] = sum;
  }
  return out;
}

function outer(a, b) {
  const out = zeros(a.length, b.length);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      out[i][j] = a[i] * b[j];
    }
  }
  return out;
}

export class DqnModel {
  constructor({ inputSize, hiddenSize1 = 64, hiddenSize2 = 64, outputSize = 24, learningRate = 0.001 }) {
    this.inputSize = inputSize;
    this.hiddenSize1 = hiddenSize1;
    this.hiddenSize2 = hiddenSize2;
    this.outputSize = outputSize;
    this.learningRate = learningRate;

    this.w1 = zeros(hiddenSize1, inputSize).map((r) => r.map(() => randn()));
    this.b1 = Array(hiddenSize1).fill(0);
    this.w2 = zeros(hiddenSize2, hiddenSize1).map((r) => r.map(() => randn()));
    this.b2 = Array(hiddenSize2).fill(0);
    this.w3 = zeros(outputSize, hiddenSize2).map((r) => r.map(() => randn()));
    this.b3 = Array(outputSize).fill(0);
  }

  forward(state) {
    const z1 = matVecMul(this.w1, state, this.b1);
    const a1 = relu(z1);
    const z2 = matVecMul(this.w2, a1, this.b2);
    const a2 = relu(z2);
    const qValues = matVecMul(this.w3, a2, this.b3);
    return { z1, a1, z2, a2, qValues };
  }

  predict(state) {
    return this.forward(state).qValues;
  }

  trainBatch(samples, gamma = 0.95) {
    let loss = 0;
    for (const sample of samples) {
      const { state, action, reward, nextState, done } = sample;
      const cache = this.forward(state);
      const nextQ = this.predict(nextState);
      const maxNextQ = Math.max(...nextQ);
      const targetQ = reward + (done ? 0 : gamma * maxNextQ);

      const pred = cache.qValues[action];
      const err = pred - targetQ;
      loss += err * err;

      const dOut = Array(this.outputSize).fill(0);
      dOut[action] = 2 * err;

      const dW3 = outer(dOut, cache.a2);
      const dB3 = dOut;

      const dA2 = Array(this.hiddenSize2).fill(0);
      for (let i = 0; i < this.outputSize; i += 1) {
        for (let j = 0; j < this.hiddenSize2; j += 1) {
          dA2[j] += this.w3[i][j] * dOut[i];
        }
      }

      const dZ2 = dA2.map((v, i) => v * reluGrad(cache.z2)[i]);
      const dW2 = outer(dZ2, cache.a1);
      const dB2 = dZ2;

      const dA1 = Array(this.hiddenSize1).fill(0);
      for (let i = 0; i < this.hiddenSize2; i += 1) {
        for (let j = 0; j < this.hiddenSize1; j += 1) {
          dA1[j] += this.w2[i][j] * dZ2[i];
        }
      }

      const dZ1 = dA1.map((v, i) => v * reluGrad(cache.z1)[i]);
      const dW1 = outer(dZ1, state);
      const dB1 = dZ1;

      this.applyGradients(dW1, dB1, dW2, dB2, dW3, dB3);
    }

    return loss / Math.max(1, samples.length);
  }

  applyGradients(dW1, dB1, dW2, dB2, dW3, dB3) {
    const lr = this.learningRate;
    for (let i = 0; i < this.hiddenSize1; i += 1) {
      for (let j = 0; j < this.inputSize; j += 1) this.w1[i][j] -= lr * dW1[i][j];
      this.b1[i] -= lr * dB1[i];
    }
    for (let i = 0; i < this.hiddenSize2; i += 1) {
      for (let j = 0; j < this.hiddenSize1; j += 1) this.w2[i][j] -= lr * dW2[i][j];
      this.b2[i] -= lr * dB2[i];
    }
    for (let i = 0; i < this.outputSize; i += 1) {
      for (let j = 0; j < this.hiddenSize2; j += 1) this.w3[i][j] -= lr * dW3[i][j];
      this.b3[i] -= lr * dB3[i];
    }
  }

  toJSON() {
    return {
      inputSize: this.inputSize,
      hiddenSize1: this.hiddenSize1,
      hiddenSize2: this.hiddenSize2,
      outputSize: this.outputSize,
      learningRate: this.learningRate,
      w1: this.w1,
      b1: this.b1,
      w2: this.w2,
      b2: this.b2,
      w3: this.w3,
      b3: this.b3,
    };
  }

  static fromJSON(json) {
    const m = new DqnModel(json);
    m.w1 = json.w1; m.b1 = json.b1;
    m.w2 = json.w2; m.b2 = json.b2;
    m.w3 = json.w3; m.b3 = json.b3;
    return m;
  }

  async save(filePath) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(this.toJSON()), "utf8");
  }

  static async load(filePath, fallbackConfig) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return DqnModel.fromJSON(JSON.parse(raw));
    } catch {
      return new DqnModel(fallbackConfig);
    }
  }
}
