export class AudioEngine {
  private volume = 0.7;

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume() {
    return this.volume;
  }

  getSpectrumSeed() {
    const base = Date.now() / 1000;
    return Array.from({ length: 32 }, (_, i) => Math.abs(Math.sin(base + i / 3)) * this.volume);
  }
}

export const audioEngine = new AudioEngine();
