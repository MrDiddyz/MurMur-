export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export interface MemoryRetriever {
  retrieve(query: string): Promise<Array<{ id: string; score: number; content: string }>>;
}

export interface MemoryRanker {
  rank(items: Array<{ id: string; score: number; content: string }>): Promise<Array<{ id: string; score: number; content: string }>>;
}
