"use client";

type Props = {
  isPlaying: boolean;
  canPrev: boolean;
  canNext: boolean;
  onToggle: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClearSongs: () => void;
};

export default function PlayerControls({
  isPlaying,
  canPrev,
  canNext,
  onToggle,
  onStop,
  onPrev,
  onNext,
  onClearSongs,
}: Props) {
  return (
    <div className="row">
      <button className="btn" onClick={onToggle} type="button">
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button className="btn" onClick={onStop} type="button">
        Stop
      </button>
      <button className="btn" onClick={onPrev} type="button" disabled={!canPrev}>
        Prev
      </button>
      <button className="btn" onClick={onNext} type="button" disabled={!canNext}>
        Next
      </button>
      <button className="btn" onClick={onClearSongs} type="button">
        Clear songs
      </button>
    </div>
  );
}
