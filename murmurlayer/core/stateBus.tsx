'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type AudioMetrics = {
  rms: number;
  bassEnergy: number;
  midEnergy: number;
  trebleEnergy: number;
};

export type Track = { file: File; url: string; name: string };
export type ImageFile = { file: File; url: string };

type StateBusContextType = {
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  images: ImageFile[];
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  activeTrackIdx: number;
  setActiveTrackIdx: React.Dispatch<React.SetStateAction<number>>;
  activeImageIdx: number;
  setActiveImageIdx: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  eqValues: number[];
  setEqValues: React.Dispatch<React.SetStateAction<number[]>>;
  metricsRef: React.MutableRefObject<AudioMetrics>;
  performanceRef: React.MutableRefObject<{ fps: number; quality: number }>;
};

const StateBusContext = createContext<StateBusContextType | null>(null);

export const StateBusProvider = ({ children }: { children: React.ReactNode }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [eqValues, setEqValues] = useState<number[]>(new Array(10).fill(0));

  // High frequency data bypasses React state to prevent 60fps re-renders
  const metricsRef = useRef<AudioMetrics>({
    rms: 0,
    bassEnergy: 0,
    midEnergy: 0,
    trebleEnergy: 0,
  });
  const performanceRef = useRef({ fps: 60, quality: 1.0 });

  // Cleanup ObjectURLs on unmount
  useEffect(() => {
    return () => {
      tracks.forEach((t) => URL.revokeObjectURL(t.url));
      images.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, [tracks, images]);

  return (
    <StateBusContext.Provider
      value={{
        tracks,
        setTracks,
        images,
        setImages,
        activeTrackIdx,
        setActiveTrackIdx,
        activeImageIdx,
        setActiveImageIdx,
        isPlaying,
        setIsPlaying,
        eqValues,
        setEqValues,
        metricsRef,
        performanceRef,
      }}
    >
      {children}
    </StateBusContext.Provider>
  );
};

export const useStateBus = () => {
  const ctx = useContext(StateBusContext);
  if (!ctx) throw new Error('useStateBus must be used within StateBusProvider');
  return ctx;
};
