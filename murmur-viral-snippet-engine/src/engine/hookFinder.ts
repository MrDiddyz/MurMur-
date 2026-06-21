import { CandidateWindow, Track } from "../types.js";

function classify(lines: string, cueText: string): string {
  const cue = cueText.toLowerCase();
  const text = lines.toLowerCase();

  if ((cue.includes("whisper") || cue.includes("airy")) && (cue.includes("kick") || cue.includes("808"))) {
    return "whisper_drop";
  }
  if (text.includes("\"") || text.includes("'") || text.includes("poison") || text.includes("heartbeat")) {
    return "quote_clip";
  }
  if (text.includes("still") || text.includes("miss") || text.includes("ghost")) {
    return "sad_loop";
  }
  return "hook_first";
}

export function hookFinder(track: Track): CandidateWindow[] {
  const windows: CandidateWindow[] = [];
  const n = track.lyrics.length;

  for (let i = 0; i < n; i += 1) {
    for (let size = 2; size <= 4; size += 1) {
      const lines = track.lyrics.slice(i, i + size);
      if (lines.length < 2) continue;
      const joined = lines.map(l => l.text).join(" ");
      const cues = lines.map(l => l.cue).join(" | ");
      windows.push({
        lines,
        snippetType: classify(joined, cues)
      });
    }
  }

  // Non-contiguous pairings create extra quote-like cuts for short-form edits.
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 2; j < n; j += 1) {
      const lines = [track.lyrics[i], track.lyrics[j]];
      const joined = lines.map(l => l.text).join(" ");
      const cues = lines.map(l => l.cue).join(" | ");
      windows.push({
        lines,
        snippetType: classify(joined, cues)
      });
    }
  }

  // prioritize hook-heavy windows by prepending those
  const hookWindows = windows.filter(w => w.lines.some(l => l.section.toLowerCase().includes("hook")));
  const unique = new Map<string, CandidateWindow>();
  for (const win of [...hookWindows, ...windows]) {
    const key = win.lines.map(l => `${l.section}:${l.text}`).join("||");
    if (!unique.has(key)) unique.set(key, win);
  }

  return [...unique.values()];
}
