"use client";

type Track = { name: string; url: string };

type Props = {
  tracks: Track[];
  currentIdx: number;
  onPlayIdx: (idx: number) => void;
};

export default function Playlist({ tracks, currentIdx, onPlayIdx }: Props) {
  return (
    <div className="panel" style={{ borderRadius: 12 }}>
      <div className="panel-h">
        <div>Playlist</div>
        <span className="badge">Click to play</span>
      </div>
      <div className="list">
        {tracks.length === 0 && <div style={{ padding: 12, opacity: 0.8 }}>Last opp MP3 og trykk Play.</div>}
        {tracks.map((t, i) => (
          <div key={t.url} className="item" onClick={() => onPlayIdx(i)} role="button" aria-label={`Play ${t.name}`}>
            <span style={{ opacity: i === currentIdx ? 1 : 0.85 }}>
              {i + 1}. {t.name}
            </span>
            {i === currentIdx && <span className="badge">LIVE</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
