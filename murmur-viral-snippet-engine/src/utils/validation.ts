import { Track } from "../types.js";

export function validateTrack(track: Track): string[] {
  const errors: string[] = [];

  if (!track.id) errors.push("track.id is required");
  if (!track.title) errors.push("track.title is required");
  if (!track.artist) errors.push("track.artist is required");
  if (!Array.isArray(track.anchor_words) || track.anchor_words.length === 0) {
    errors.push("track.anchor_words must be a non-empty array");
  }
  if (!Array.isArray(track.lyrics) || track.lyrics.length < 2) {
    errors.push("track.lyrics must contain at least 2 lines");
  }

  if (track.tiktok_profile && !track.tiktok_profile.startsWith("@")) {
    errors.push("track.tiktok_profile must start with '@'");
  }

  track.lyrics.forEach((line, idx) => {
    if (!line.section) errors.push(`lyrics[${idx}].section is required`);
    if (!line.text) errors.push(`lyrics[${idx}].text is required`);
    if (!line.cue) errors.push(`lyrics[${idx}].cue is required`);
  });

  return errors;
}
