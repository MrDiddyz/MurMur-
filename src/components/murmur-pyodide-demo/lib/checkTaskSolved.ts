import type { TaskId } from './taskSoundMap';

const checks: Record<TaskId, (normalized: string[]) => boolean> = {
  task1: (normalized) => normalized.some((line) => line.includes('murmur: hei')),
  task2: (normalized) => normalized.some((line) => line.includes('murmur: hei,') && line.includes('!')),
  task3: (normalized) => normalized.some((line) => line.includes('jakke') || line.includes('smil')),
  task4: (normalized) => normalized.some((line) => line.includes('stort') || line.includes('lite')),
  task5: (normalized) => normalized.filter((line) => line.includes('tre vokser')).length >= 3,
};

export const checkTaskSolved = (taskId: TaskId, normalizedOutputLines: string[]): boolean => checks[taskId](normalizedOutputLines);
