import type { AIResponse } from './types';

const SYSTEM_PROMPT = `You are a compassionate AI learning companion. When given a personal reflection, respond with exactly four fields in valid JSON:
- "mirror": A brief, empathetic restatement of what the person shared (1-2 sentences).
- "insight": A deeper observation or pattern you notice in their reflection (1-2 sentences).
- "next_step": One concrete, actionable suggestion they can take today (1 sentence).
- "creative_suggestion": A playful or creative idea to explore the theme further (1 sentence).

Return ONLY valid JSON. No markdown, no explanation outside the JSON object.`;

const MOCK_RESPONSE: AIResponse = {
  mirror:
    'I hear you exploring something meaningful — a moment of honest self-examination.',
  insight:
    'There is a recurring theme of curiosity in your reflection, suggesting an openness to growth.',
  next_step:
    'Write three things you are grateful for from this experience in a small notebook today.',
  creative_suggestion:
    'Create a simple sketch or mind-map that visually represents how this reflection connects to your broader goals.',
};

export async function getAIResponse(content: string): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Return mock response when no API key is configured (development/demo)
    return MOCK_RESPONSE;
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = data.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as Partial<AIResponse>;

  return {
    mirror: parsed.mirror ?? MOCK_RESPONSE.mirror,
    insight: parsed.insight ?? MOCK_RESPONSE.insight,
    next_step: parsed.next_step ?? MOCK_RESPONSE.next_step,
    creative_suggestion:
      parsed.creative_suggestion ?? MOCK_RESPONSE.creative_suggestion,
  };
}
