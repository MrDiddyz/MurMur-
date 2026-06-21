import { CAPTION_BANK, DEFAULT_ON_SCREEN } from "../config.js";

export function pickOnScreen(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes("NEON")) return "NEON LOVE";
  if (upper.includes("GHOST")) return "YOUR GHOST";
  if (upper.includes("POISON")) return "POISON HEART";
  if (upper.includes("HEARTBEAT")) return "HEARTBEAT IN THE DARK";
  if (upper.includes("FIRE")) return "FIRE INSIDE";
  return DEFAULT_ON_SCREEN[0];
}

export function pickCaption(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("addiction") || lower.includes("fackd")) return "neon made me weak";
  if (lower.includes("ghost") || lower.includes("miss")) return "ghosts still text me";
  if (lower.includes("poison") || lower.includes("kiss")) return "poison tastes like home";
  if (lower.includes("heartbeat") || lower.includes("city")) return "heartbeat in the dark";
  return CAPTION_BANK[0];
}
