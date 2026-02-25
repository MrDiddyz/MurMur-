"use client";

type Props = {
  onUploadMp3: (files: FileList | null) => void;
  onUploadImages: (files: FileList | null) => void;
};

export default function UploadPanel({ onUploadMp3, onUploadImages }: Props) {
  return (
    <div className="row">
      <label className="btn" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
        Upload MP3 (max 10)
        <input
          type="file"
          accept=".mp3,audio/mpeg"
          multiple
          style={{ display: "none" }}
          onChange={(e) => onUploadMp3(e.target.files)}
        />
      </label>

      <label className="btn" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
        Upload images (max 10)
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => onUploadImages(e.target.files)}
        />
      </label>
    </div>
  );
}
