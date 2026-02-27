export type MemoryItem = {
  input: string;
  output: string;
};

const memory: MemoryItem[] = [];

export function storeMemory(item: MemoryItem) {
  memory.push(item);
}

export function getMemory(): MemoryItem[] {
  return memory;
}
