import { checkTaskSolved } from './checkTaskSolved';
import { normalizeOutputLines } from './detectSignals';
import { getMurmurText } from './getMurmurText';
import { updateHintLevel, type HintState } from './hintState';
import type { TaskId } from './taskSoundMap';

type Args = {
  taskId: TaskId;
  rawOutput: string;
  error: unknown;
  ran: boolean;
  safetyScore: number;
  style: string;
  hintState: HintState;
};

export const makeTaskResultWithHintLevel = ({ taskId, rawOutput, error, ran, safetyScore, style, hintState }: Args) => {
  const outputLines = rawOutput ? rawOutput.split(/\r?\n/).filter(Boolean) : [];
  const normalized = normalizeOutputLines(rawOutput);
  const ok = !error && checkTaskSolved(taskId, normalized);
  const hintLevel = updateHintLevel(hintState, taskId, Boolean(ok));

  return {
    taskId,
    rawOutput,
    outputLines,
    ran,
    error,
    ok,
    safetyScore,
    style,
    hintLevel,
    murmurText: getMurmurText(Boolean(ok), hintLevel),
    detected: {
      loopCount: outputLines.length,
      functionCalled: normalized.some((line) => line.includes('murmur')),
      ok,
    },
  };
};
