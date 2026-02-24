'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const audioSrc = process.env.NEXT_PUBLIC_MURMUR_AUDIO_SRC;

type Engine = {
  context: AudioContext;
  analyser: AnalyserNode;
  intervalId: number;
  stop: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createSynthEngine(bpm: number, intensity: number): Engine {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 256;

  const master = context.createGain();
  master.gain.value = 0.55;
  master.connect(analyser);
  analyser.connect(context.destination);

  const beatMs = 60000 / bpm;
  let step = 0;

  function playKick(time: number) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.16);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.8 * (intensity / 100), time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.22);
  }

  function playLead(time: number, index: number) {
    const notes = [220, 247, 262, 294, 330, 349, 392, 440];
    const note = notes[index % notes.length];
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(note, time);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.16 + intensity / 700, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.25);
  }

  const intervalId = window.setInterval(() => {
    const time = context.currentTime + 0.01;
    if (step % 2 === 0) playKick(time);
    playLead(time, step + (intensity % 5));
    step += 1;
  }, beatMs / 2);

  return {
    context,
    analyser,
    intervalId,
    stop: () => {
      window.clearInterval(intervalId);
      master.disconnect();
      analyser.disconnect();
      void context.close();
    },
  };
}

export function PsychedelicEqualizer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: 24 }, () => 22));
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(122);
  const [intensity, setIntensity] = useState(72);

  const gradients = useMemo(
    () =>
      levels.map((_, index) => {
        const hueA = (index * 19) % 360;
        const hueB = (hueA + 70) % 360;
        return `linear-gradient(180deg, hsl(${hueA} 90% 72%) 0%, hsl(${hueB} 86% 48%) 100%)`;
      }),
    [levels]
  );

  useEffect(() => {
    let raf = 0;
    let demoInterval = 0;

    const audio = audioRef.current;

    const runAnalyser = (analyser: AnalyserNode) => {
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(frequencyData);
        setLevels((prev) =>
          prev.map((_, i) => {
            const bucketSize = Math.max(1, Math.floor(frequencyData.length / prev.length));
            const start = i * bucketSize;
            const slice = frequencyData.slice(start, start + bucketSize);
            const avg = slice.reduce((sum, value) => sum + value, 0) / slice.length;
            return clamp((avg / 255) * 100, 8, 100);
          })
        );
        raf = requestAnimationFrame(tick);
      };
      tick();
    };

    if (isPlaying && engineRef.current) {
      runAnalyser(engineRef.current.analyser);
      return () => cancelAnimationFrame(raf);
    }

    if (audioSrc && audio) {
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 128;
      const source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);

      const onPlay = async () => {
        if (context.state !== 'running') await context.resume();
        runAnalyser(analyser);
      };
      const onPause = () => cancelAnimationFrame(raf);

      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onPause);

      return () => {
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onPause);
        cancelAnimationFrame(raf);
        source.disconnect();
        analyser.disconnect();
        void context.close();
      };
    }

    demoInterval = window.setInterval(() => {
      setLevels((prev) =>
        prev.map((_, i) => {
          const wave = Math.sin(Date.now() / 180 + i * 0.7) * 24;
          return clamp(34 + wave + ((i % 3) - 1) * 6, 10, 96);
        })
      );
    }, 90);

    return () => window.clearInterval(demoInterval);
  }, [isPlaying]);

  function startGenerator() {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    engineRef.current = createSynthEngine(bpm, intensity);
    setIsPlaying(true);
  }

  function stopGenerator() {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }
    setIsPlaying(false);
  }

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  return (
    <section className="card space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Psykedelisk cartoon equalizer</h2>
        <p className="text-xs text-accent">{isPlaying ? 'GENERATOR LIVE' : audioSrc ? 'READY FOR AUDIO' : 'DEMO MODE'}</p>
      </div>

      <div className="rounded-2xl border border-accent/35 bg-black/30 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Generator (midtseksjon)</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-ink">
            BPM
            <input type="range" min={80} max={160} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-full" />
            <span className="block text-white">{bpm}</span>
          </label>
          <label className="space-y-2 text-sm text-ink">
            Intensitet
            <input type="range" min={10} max={100} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full" />
            <span className="block text-white">{intensity}</span>
          </label>
          <div className="flex items-end gap-3">
            <button onClick={startGenerator} type="button" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-night">
              Start generator
            </button>
            <button onClick={stopGenerator} type="button" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white">
              Stop
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-accent/35 bg-black/30 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Visualizer (nedre seksjon)</h3>
        <div className="mt-3 flex h-40 items-end gap-2 overflow-hidden rounded-xl bg-black/40 p-3">
          {levels.map((level, index) => (
            <span
              key={index}
              className="equalizer-bar"
              style={{ height: `${level}%`, backgroundImage: gradients[index], animationDelay: `${index * 0.04}s` }}
            />
          ))}
        </div>
      </div>

      {audioSrc ? (
        <audio ref={audioRef} controls className="w-full">
          <source src={audioSrc} type="audio/mpeg" />
        </audio>
      ) : null}
    </section>
  );
}
