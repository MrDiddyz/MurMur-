'use client';

import { useMemo, useRef } from 'react';
import { useStateBus } from '../core/stateBus';

export function PlayerControls({ onAudioReady }: { onAudioReady: (audio: HTMLAudioElement | null) => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { tracks, playback, setPlayback, setActiveTrack } = useStateBus();

  const activeTrack = useMemo(() => tracks.find((track) => track.id === playback.activeTrackId) ?? null, [tracks, playback.activeTrackId]);

  const cycleTrack = (direction: 1 | -1) => {
    if (tracks.length === 0 || !playback.activeTrackId) {
      return;
    }
    const index = tracks.findIndex((track) => track.id === playback.activeTrackId);
    const next = (index + direction + tracks.length) % tracks.length;
    setActiveTrack(tracks[next].id);
  };

  return (
    <section className="murmur-panel">
      <h3>Transport</h3>
      <p className="murmur-muted">{activeTrack?.name ?? 'No track selected'}</p>
      <audio
        key={activeTrack?.id ?? 'empty'}
        ref={(element) => {
          audioRef.current = element;
          onAudioReady(element);
        }}
        src={activeTrack?.url}
        controls
        preload="metadata"
        className="murmur-audio"
        onTimeUpdate={(event) => {
          const element = event.currentTarget;
          setPlayback({ currentTime: element.currentTime, duration: element.duration || 0 });
        }}
        onPlay={() => setPlayback({ isPlaying: true })}
        onPause={() => setPlayback({ isPlaying: false })}
        onEnded={() => cycleTrack(1)}
      />
      <div className="murmur-row">
        <button type="button" onClick={() => cycleTrack(-1)} disabled={tracks.length === 0}>
          ◀ Prev
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!audioRef.current) {
              return;
            }
            if (audioRef.current.paused) {
              await audioRef.current.play();
            } else {
              audioRef.current.pause();
            }
          }}
          disabled={!activeTrack}
        >
          {playback.isPlaying ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={() => cycleTrack(1)} disabled={tracks.length === 0}>
          Next ▶
        </button>
      </div>
    </section>
  );
}
