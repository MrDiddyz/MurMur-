import type { ScheduleSlot } from "./types";

export function totalBars(slots: ScheduleSlot[]): number {
  return slots.reduce((acc, slot) => acc + slot.bars, 0);
}
