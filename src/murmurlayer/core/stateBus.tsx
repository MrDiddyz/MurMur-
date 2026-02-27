'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type EqBand = {
  frequency: number;
  gain: number;
};

export type TrackItem = {
  id: string;
  name: string;
  file: File;
  url: string;
};

export type ImageItem = {
  id: string;
  name: string;
  file: File;
  url: string;
  bitmap?: ImageBitmap;
};

export type PlaybackState = {
  activeTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
};

export type AudioMetrics = {
  rms: number;
  bassEnergy: number;
  midEnergy: number;
  trebleEnergy: number;
  spectrum: Float32Array;
  waveform: Float32Array;
};

export type PerformanceState = {
  fps: number;
  estimatedMemoryMB: number;
  analyzerLoad: number;
  complexityScale: number;
};

type StateBusValue = {
  tracks: TrackItem[];
  images: ImageItem[];
  playback: PlaybackState;
  eqBands: EqBand[];
  metrics: AudioMetrics;
  performance: PerformanceState;
  addTracks: (files: File[]) => string[];
  addImages: (files: File[]) => string[];
  setImageBitmap: (id: string, bitmap: ImageBitmap) => void;
  setActiveTrack: (id: string) => void;
  setPlayback: (next: Partial<PlaybackState>) => void;
  setEqBandGain: (index: number, gain: number) => void;
  setMetrics: (next: AudioMetrics) => void;
  setPerformance: (next: Partial<PerformanceState>) => void;
  removeTrack: (id: string) => void;
  removeImage: (id: string) => void;
  trimOldestImage: () => void;
};

const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const MAX_UPLOADS = 10;

const StateBusContext = createContext<StateBusValue | null>(null);

const emptyMetrics = (): AudioMetrics => ({
  rms: 0,
  bassEnergy: 0,
  midEnergy: 0,
  trebleEnergy: 0,
  spectrum: new Float32Array(128),
  waveform: new Float32Array(128),
});

export function StateBusProvider({ children }: { children: React.ReactNode }) {
  const objectUrlsRef = useRef(new Set<string>());
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [playback, setPlaybackState] = useState<PlaybackState>({
    activeTrackId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  const [eqBands, setEqBands] = useState<EqBand[]>(EQ_FREQUENCIES.map((frequency) => ({ frequency, gain: 0 })));
  const [metrics, setMetrics] = useState<AudioMetrics>(emptyMetrics);
  const [performance, setPerformanceState] = useState<PerformanceState>({
    fps: 60,
    estimatedMemoryMB: 0,
    analyzerLoad: 0,
    complexityScale: 1,
  });

  const addTracks = useCallback(
    (files: File[]) => {
      const accepted = files.filter((file) => file.type.includes('mpeg') || file.name.toLowerCase().endsWith('.mp3')).slice(0, MAX_UPLOADS - tracks.length);
      const createdIds: string[] = [];
      const nextTracks = accepted.map((file) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.add(url);
        const id = `${file.name}-${crypto.randomUUID()}`;
        createdIds.push(id);
        return { id, name: file.name, file, url };
      });

      if (nextTracks.length > 0) {
        setTracks((previous) => [...previous, ...nextTracks]);
        setPlaybackState((previous) => ({ ...previous, activeTrackId: previous.activeTrackId ?? nextTracks[0].id }));
      }

      return createdIds;
    },
    [tracks.length],
  );

  const addImages = useCallback(
    (files: File[]) => {
      const accepted = files.filter((file) => file.type.startsWith('image/')).slice(0, MAX_UPLOADS - images.length);
      const createdIds: string[] = [];
      const nextImages = accepted.map((file) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.add(url);
        const id = `${file.name}-${crypto.randomUUID()}`;
        createdIds.push(id);
        return { id, name: file.name, file, url };
      });

      if (nextImages.length > 0) {
        setImages((previous) => [...previous, ...nextImages]);
      }

      return createdIds;
    },
    [images.length],
  );

  const setImageBitmap = useCallback((id: string, bitmap: ImageBitmap) => {
    setImages((previous) => previous.map((item) => (item.id === id ? { ...item, bitmap } : item)));
  }, []);

  const setActiveTrack = useCallback((id: string) => {
    setPlaybackState((previous) => ({ ...previous, activeTrackId: id }));
  }, []);

  const setPlayback = useCallback((next: Partial<PlaybackState>) => {
    setPlaybackState((previous) => ({ ...previous, ...next }));
  }, []);

  const setEqBandGain = useCallback((index: number, gain: number) => {
    setEqBands((previous) => previous.map((band, bandIndex) => (bandIndex === index ? { ...band, gain } : band)));
  }, []);

  const removeTrack = useCallback((id: string) => {
    setTracks((previous) => {
      const removed = previous.find((track) => track.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
        objectUrlsRef.current.delete(removed.url);
      }
      return previous.filter((track) => track.id !== id);
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((previous) => {
      const removed = previous.find((image) => image.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
        objectUrlsRef.current.delete(removed.url);
      }
      return previous.filter((image) => image.id !== id);
    });
  }, []);

  const setPerformance = useCallback((next: Partial<PerformanceState>) => {
    setPerformanceState((previous) => ({ ...previous, ...next }));
  }, []);

  const trimOldestImage = useCallback(() => {
    setImages((previous) => {
      const [oldest, ...rest] = previous;
      if (oldest) {
        URL.revokeObjectURL(oldest.url);
        objectUrlsRef.current.delete(oldest.url);
      }
      return rest;
    });
  }, []);

  const value = useMemo<StateBusValue>(
    () => ({
      tracks,
      images,
      playback,
      eqBands,
      metrics,
      performance,
      addTracks,
      addImages,
      setImageBitmap,
      setActiveTrack,
      setPlayback,
      setEqBandGain,
      setMetrics,
      setPerformance,
      removeTrack,
      removeImage,
      trimOldestImage,
    }),
    [tracks, images, playback, eqBands, metrics, performance, addTracks, addImages, setImageBitmap, setActiveTrack, setPlayback, setEqBandGain, removeTrack, removeImage, trimOldestImage, setPerformance],
  );

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  return <StateBusContext.Provider value={value}>{children}</StateBusContext.Provider>;
}

export function useStateBus() {
  const context = useContext(StateBusContext);
  if (!context) {
    throw new Error('useStateBus must be used inside StateBusProvider');
  }
  return context;
}
