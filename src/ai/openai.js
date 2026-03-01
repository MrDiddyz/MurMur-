import OpenAI from "openai";
import { config } from "../config.js";

const client = new OpenAI({ apiKey: config.openaiKey });

export async function generateAIResponse(userPrompt) {
  const resp = await client.chat.completions.create({
    model: config.openaiModel,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are MurMur AI. Be helpful, concise, non-spammy. Write in Norwegian unless user uses English. Avoid claims you can't support."
      },
      { role: "user", content: userPrompt }
    ]
  });

  return resp.choices?.[0]?.message?.content?.trim() || "Jeg fikk ikke generert et svar denne gangen.";
}
