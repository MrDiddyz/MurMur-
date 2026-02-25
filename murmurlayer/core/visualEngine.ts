import { audioEngine } from './audioEngine';

export function generateBars(barCount = 24) {
  const spectrum = audioEngine.getSpectrumSeed();
  return Array.from({ length: barCount }, (_, i) => {
    const value = spectrum[i % spectrum.length] ?? 0;
    return 10 + Math.round(value * 90);
  });
}
