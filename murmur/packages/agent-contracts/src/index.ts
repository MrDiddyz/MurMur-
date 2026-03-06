export interface AgentRequest {
  prompt: string;
}

export interface AgentResponse {
  content: string;
  confidence: number;
}
