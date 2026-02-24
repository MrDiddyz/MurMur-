'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const audioSrc = process.env.NEXT_PUBLIC_MURMUR_AUDIO_SRC;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function PsychedelicEqualizer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: 24 }, () => 22));
  const [isPlaying, setIsPlaying] = useState(false);

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
    const audio = audioRef.current;
    if (!audio || !audioSrc) {
      const id = window.setInterval(() => {
        setLevels((prev) =>
          prev.map((_, i) => {
            const wave = Math.sin(Date.now() / 180 + i * 0.7) * 24;
            return clamp(34 + wave + ((i % 3) - 1) * 6, 10, 96);
          })
        );
      }, 90);
      return () => window.clearInterval(id);
    }

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 128;

    const source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;

    const loop = () => {
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
      raf = requestAnimationFrame(loop);
    };

    const onPlay = async () => {
      if (context.state !== 'running') {
        await context.resume();
      }
      setIsPlaying(true);
      loop();
    };

    const onPause = () => {
      setIsPlaying(false);
      cancelAnimationFrame(raf);
    };

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
  }, []);

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Psykedelisk cartoon equalizer</h2>
        <p className="text-xs text-accent">{audioSrc ? (isPlaying ? 'LIVE MODE' : 'Ready for audio') : 'DEMO MODE'}</p>
      </div>

      <div className="rounded-2xl border border-accent/35 bg-black/30 p-4">
        <div className="flex h-40 items-end gap-2 overflow-hidden rounded-xl bg-black/40 p-3">
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
      ) : (
        <p className="text-sm text-ink">
          Sett <code>NEXT_PUBLIC_MURMUR_AUDIO_SRC</code> for å synce equalizer med faktisk musikk.
        </p>
      )}
    </section>
  );
}
