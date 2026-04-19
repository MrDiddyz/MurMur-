'use client';

import { useState } from 'react';
import { useStateBus } from '../core/stateBus';

export function UploadPanel() {
  const { addTracks, addImages, tracks, images } = useStateBus();
  const [message, setMessage] = useState('');

  return (
    <section className="murmur-panel">
      <h3>Upload Hub</h3>
      <p className="murmur-muted">MP3 max 10 · Images max 10 · lazy decode enabled</p>
      <div className="murmur-upload-grid">
        <label>
          <span>Tracks ({tracks.length}/10)</span>
          <input
            type="file"
            accept="audio/mpeg,.mp3"
            multiple
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              addTracks(selected);
              setMessage(`Accepted ${Math.min(10 - tracks.length, selected.length)} tracks.`);
              event.target.value = '';
            }}
          />
        </label>
        <label>
          <span>Images ({images.length}/10)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              addImages(selected);
              setMessage(`Accepted ${Math.min(10 - images.length, selected.length)} images.`);
              event.target.value = '';
            }}
          />
        </label>
      </div>
      {message ? <p className="murmur-muted">{message}</p> : null}
    </section>
  );
}
