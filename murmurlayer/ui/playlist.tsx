'use client';

import { useMemo } from 'react';
import { useStateBus } from '../core/stateBus';

export function Playlist() {
  const { tracks, playback, setActiveTrack, removeTrack } = useStateBus();

  const activeName = useMemo(() => tracks.find((track) => track.id === playback.activeTrackId)?.name ?? 'No track', [tracks, playback.activeTrackId]);

  return (
    <section className="murmur-panel">
      <h3>Playlist</h3>
      <p className="murmur-muted">Now selected: {activeName}</p>
      {tracks.length === 0 ? (
        <p className="murmur-muted">Upload tracks to start playback.</p>
      ) : (
        <ul className="murmur-list">
          {tracks.map((track) => (
            <li key={track.id} className={track.id === playback.activeTrackId ? 'active' : ''}>
              <button type="button" onClick={() => setActiveTrack(track.id)}>
                {track.name}
              </button>
              <button type="button" className="danger" onClick={() => removeTrack(track.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
