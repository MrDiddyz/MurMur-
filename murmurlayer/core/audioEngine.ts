export type EQBand = {
  label: string;
  freq: number;
  type: BiquadFilterType;
  q: number;
  gain: number;
};

export const DEFAULT_EQ: EQBand[] = [
  { label: "31", freq: 31, type: "lowshelf", q: 0.7, gain: 0 },
  { label: "62", freq: 62, type: "peaking", q: 1.0, gain: 0 },
  { label: "125", freq: 125, type: "peaking", q: 1.0, gain: 0 },
  { label: "250", freq: 250, type: "peaking", q: 1.0, gain: 0 },
  { label: "500", freq: 500, type: "peaking", q: 1.0, gain: 0 },
  { label: "1k", freq: 1000, type: "peaking", q: 1.0, gain: 0 },
  { label: "2k", freq: 2000, type: "peaking", q: 1.0, gain: 0 },
  { label: "4k", freq: 4000, type: "peaking", q: 1.0, gain: 0 },
  { label: "8k", freq: 8000, type: "peaking", q: 1.0, gain: 0 },
  { label: "16k", freq: 16000, type: "highshelf", q: 0.7, gain: 0 },
];

export type Engine = {
  ctx: AudioContext;
  source: MediaElementAudioSourceNode;
  analyser: AnalyserNode;
  master: GainNode;
  eq: BiquadFilterNode[];
  destroy: () => void;
};

export function createEngine(audioEl: HTMLAudioElement, eqBands = DEFAULT_EQ): Engine {
  const CtxCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!CtxCtor) throw new Error("Web Audio API is not supported in this browser.");

  const ctx = new CtxCtor();
  const source = ctx.createMediaElementSource(audioEl);

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.85;

  const master = ctx.createGain();
  master.gain.value = 0.9;

  const eq = eqBands.map((band) => {
    const filter = ctx.createBiquadFilter();
    filter.type = band.type;
    filter.frequency.value = band.freq;
    filter.Q.value = band.q;
    filter.gain.value = band.gain;
    return filter;
  });

  if (eq.length > 0) {
    source.connect(eq[0]);
    for (let i = 0; i < eq.length - 1; i += 1) eq[i].connect(eq[i + 1]);
    eq[eq.length - 1].connect(analyser);
  } else {
    source.connect(analyser);
  }

  analyser.connect(master);
  master.connect(ctx.destination);

  const destroy = () => {
    try { source.disconnect(); } catch { /* noop */ }
    try { analyser.disconnect(); } catch { /* noop */ }
    try { master.disconnect(); } catch { /* noop */ }
    eq.forEach((node) => {
      try { node.disconnect(); } catch { /* noop */ }
    });
    void ctx.close();
  };

  return { ctx, source, analyser, master, eq, destroy };
}
