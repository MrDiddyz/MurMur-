'use client';

import { useStateBus } from '../core/stateBus';

export function UploadPanel() {
  const { setTracks, setImages } = useStateBus();

  return (
    <section className="panel glass-panel">
      <h2 className="neon-text">Upload</h2>
      <label className="upload-zone">
        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (!files.length) return;
            setTracks((prev) => [
              ...prev,
              ...files.map((file) => ({
                file,
                name: file.name,
                url: URL.createObjectURL(file),
              })),
            ]);
          }}
        />
        <span>Drop audio stems here or click to browse</span>
      </label>

      <label className="upload-zone">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (!files.length) return;
            setImages((prev) => [
              ...prev,
              ...files.map((file) => ({
                file,
                url: URL.createObjectURL(file),
              })),
            ]);
          }}
        />
        <span>Upload visuals (images)</span>
      </label>
    </section>
  );
}
