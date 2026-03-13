'use client';

import { useStateBus } from '../core/stateBus';

export function Playlist() {
  const { tracks, activeTrackIdx, setActiveTrackIdx } = useStateBus();

  return (
    <section className="panel glass-panel">
      <h2 className="neon-text">Playlist</h2>
      <ul className="playlist">
        {tracks.length === 0 ? (
          <li>
            <small>No uploaded tracks yet.</small>
          </li>
        ) : (
          tracks.map((track, idx) => (
            <li key={`${track.name}-${idx}`}>
              <button className={activeTrackIdx === idx ? 'active' : ''} onClick={() => setActiveTrackIdx(idx)}>
                <span>{track.name}</span>
                <small>Track {idx + 1}</small>
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
