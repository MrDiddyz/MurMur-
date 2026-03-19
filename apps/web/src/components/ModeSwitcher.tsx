// Switches between ID / Mirror / Free / Performance Sync modes.
import type { StudioMode } from "@murmur/shared";

const modes: StudioMode[] = ["ID", "MIRROR", "FREE", "PERFORMANCE_SYNC"];

export function ModeSwitcher({ mode, onChange }: { mode: StudioMode; onChange: (value: StudioMode) => void }) {
  return (
    <div className="mode-row">
      {modes.map((item) => (
        <button key={item} onClick={() => onChange(item)} style={{ opacity: item === mode ? 1 : 0.65 }}>
          {item}
        </button>
      ))}
    </div>
  );
}
