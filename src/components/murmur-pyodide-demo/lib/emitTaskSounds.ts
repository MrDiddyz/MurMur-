import type { HintState } from './hintState';
import { MurmurMusicEngine } from './murmurMusicEngine';
import type { TaskId } from './taskSoundMap';

type EmitArgs = {
  engine: MurmurMusicEngine;
  taskId: TaskId;
  result: { ok: boolean };
  safetyScore: number;
  runToken: string;
  state: HintState;
};

export const emitTaskSounds = ({ engine, result }: EmitArgs) => {
  if (result.ok) engine.playSuccess();
  else engine.playRetry();
};
