import type { TaskId } from './taskSoundMap';

export type HintState = {
  attemptsByTask: Record<TaskId, number>;
  streakByTask: Record<TaskId, number>;
};

const emptyTaskRecord = (): Record<TaskId, number> => ({
  task1: 0,
  task2: 0,
  task3: 0,
  task4: 0,
  task5: 0,
});

export const createHintState = (): HintState => ({
  attemptsByTask: emptyTaskRecord(),
  streakByTask: emptyTaskRecord(),
});

export const updateHintLevel = (state: HintState, taskId: TaskId, ok: boolean): number => {
  state.attemptsByTask[taskId] += 1;

  if (ok) {
    state.streakByTask[taskId] += 1;
    return 0;
  }

  state.streakByTask[taskId] = 0;
  const attempts = state.attemptsByTask[taskId];

  if (attempts >= 3) return 2;
  if (attempts >= 2) return 1;
  return 0;
};
