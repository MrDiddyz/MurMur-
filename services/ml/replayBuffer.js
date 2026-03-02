export class ReplayBuffer {
  constructor(maxSize = 10000) {
    this.maxSize = maxSize;
    this.buffer = [];
  }

  add(experience) {
    this.buffer.push(experience);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  sample(batchSize) {
    const size = Math.min(batchSize, this.buffer.length);
    const sampled = [];
    const used = new Set();

    while (sampled.length < size) {
      const idx = Math.floor(Math.random() * this.buffer.length);
      if (used.has(idx)) continue;
      used.add(idx);
      sampled.push(this.buffer[idx]);
    }

    return sampled;
  }

  get length() {
    return this.buffer.length;
  }
}
