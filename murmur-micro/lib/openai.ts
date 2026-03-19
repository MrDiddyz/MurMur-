import OpenAI from "openai";

const defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
let cachedClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

export async function generateText(prompt: string, model: string = defaultModel): Promise<string> {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error("Prompt cannot be empty");
  }

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model,
      input: trimmedPrompt
    });

    const text = response.output_text?.trim();
    if (!text) {
      throw new Error("OpenAI returned an empty response");
    }

    return text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OpenAI error";
    throw new Error(`OpenAI request failed: ${message}`);
  }
}
