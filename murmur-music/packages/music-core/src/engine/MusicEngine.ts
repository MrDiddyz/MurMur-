import { toArrangementPrompt } from "./adapters";
import { totalBars } from "./schedulers";
import type { ScheduleSlot, SongSpec } from "./types";

export class MusicEngine {
  compose(spec: SongSpec, schedule: ScheduleSlot[]) {
    return {
      prompt: toArrangementPrompt(spec),
      lengthInBars: totalBars(schedule)
    };
  }
}
