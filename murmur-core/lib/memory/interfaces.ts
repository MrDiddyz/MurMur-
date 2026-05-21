export interface MemoryEmbeddingProvider { embed(text: string): Promise<number[]>; }
export interface MemoryRetriever { retrieve(query: string, limit?: number): Promise<Array<{ id: string; score: number; content: string }>>; }
export interface MemoryRanker { rank(items: Array<{ id: string; score: number; content: string }>): Promise<Array<{ id: string; score: number; content: string }>>; }
