'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { AudioMetrics, EqBand, TrackItem } from './stateBus';

const BASS_BIN = 12;
const MID_BIN = 42;

const toFloatArray = (input: Uint8Array, scale = 255) => {
  const output = new Float32Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    output[i] = input[i] / scale;
  }
  return output;
};

export function useAudioEngine({
  audioElement,
  activeTrack,
  isPlaying,
  eqBands,
  onMetrics,
}: {
  audioElement: HTMLAudioElement | null;
  activeTrack: TrackItem | null;
  isPlaying: boolean;
  eqBands: EqBand[];
  onMetrics: (metrics: AudioMetrics) => void;
}) {
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!audioElement) {
      return;
    }

    if (!contextRef.current) {
      contextRef.current = new AudioContext({ latencyHint: 'interactive' });
    }

    if (!analyserRef.current) {
      const analyser = contextRef.current.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.75;
      analyserRef.current = analyser;
    }

    if (!sourceRef.current) {
      sourceRef.current = contextRef.current.createMediaElementSource(audioElement);
    }

    if (eqFiltersRef.current.length === 0) {
      eqFiltersRef.current = eqBands.map((band) => {
        const filter = contextRef.current!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = band.frequency;
        filter.Q.value = 1.1;
        filter.gain.value = band.gain;
        return filter;
      });
    }

    const chain = [sourceRef.current, ...eqFiltersRef.current, analyserRef.current, contextRef.current.destination] as AudioNode[];

    chain.forEach((node, index) => {
      if (index < chain.length - 1) {
        node.disconnect();
        node.connect(chain[index + 1]);
      }
    });

    const analyser = analyserRef.current;
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const waveformData = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(waveformData);

      const spectrum = toFloatArray(frequencyData);
      const waveform = toFloatArray(waveformData, 128);

      const rms = Math.sqrt(waveform.reduce((sum, value) => sum + (value - 1) ** 2, 0) / waveform.length);
      const bassEnergy = spectrum.slice(0, BASS_BIN).reduce((sum, value) => sum + value, 0) / BASS_BIN;
      const midEnergy = spectrum.slice(BASS_BIN, MID_BIN).reduce((sum, value) => sum + value, 0) / (MID_BIN - BASS_BIN);
      const trebleEnergy = spectrum.slice(MID_BIN).reduce((sum, value) => sum + value, 0) / (spectrum.length - MID_BIN);

      onMetrics({ rms, bassEnergy, midEnergy, trebleEnergy, spectrum, waveform });
      rafRef.current = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      void contextRef.current.resume();
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [audioElement, activeTrack?.id, isPlaying, eqBands, onMetrics]);

  useEffect(() => {
    eqBands.forEach((band, index) => {
      const filter = eqFiltersRef.current[index];
      if (filter) {
        filter.gain.value = band.gain;
      }
    });
  }, [eqBands]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      eqFiltersRef.current.forEach((filter) => filter.disconnect());
      analyserRef.current?.disconnect();
      if (contextRef.current) {
        void contextRef.current.close();
      }
    };
  }, []);

  const setAnalyzerQuality = useCallback((fftSize: number, smoothing: number) => {
    if (analyserRef.current) {
      analyserRef.current.fftSize = fftSize;
      analyserRef.current.smoothingTimeConstant = smoothing;
    }
  }, []);

  return useMemo(() => ({ analyser: analyserRef.current, setAnalyzerQuality }), [setAnalyzerQuality]);
}

