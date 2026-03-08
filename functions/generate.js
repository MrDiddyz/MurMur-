const genres = ["ambient", "drum and bass", "cinematic", "future garage", "afro house"];
const moods = ["hopeful", "dark", "euphoric", "melancholic", "playful"];
const settings = ["rainy neon city", "sunrise rooftop", "deep forest", "orbital station", "desert highway"];

const MAX_SEED_LENGTH = 500;
const OPENAI_TIMEOUT_MS = 12000;

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function sanitizeSeedPrompt(seedPrompt = "") {
  if (typeof seedPrompt !== "string") {
    return "";
  }

  return seedPrompt.replace(/\s+/g, " ").trim().slice(0, MAX_SEED_LENGTH);
}

function fallbackPrompt(seedPrompt = "") {
  const base = `Compose a ${randomItem(moods)} ${randomItem(genres)} track set in a ${randomItem(settings)}. Include textured synth layers, evolving percussion, and a memorable hook.`;
  if (!seedPrompt) {
    return `${base} Keep it under 2 minutes.`;
  }

  return `${base} Remix this idea while preserving its core vibe: "${seedPrompt}".`;
}

function extractTextFromResponse(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = data?.output;
  if (!Array.isArray(output)) {
    return "";
  }

  const chunks = [];
  for (const item of output) {
    if (!Array.isArray(item?.content)) {
      continue;
    }

    for (const content of item.content) {
      if (typeof content?.text === "string" && content.text.trim()) {
        chunks.push(content.text.trim());
      }
    }
  }

  return chunks.join("\n").trim();
}

async function openAIPrompt(seedPrompt = "") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackPrompt(seedPrompt);
  }

  const instruction = seedPrompt
    ? `Remix the following music prompt into a fresh version with different details but similar intent:\n\n${seedPrompt}`
    : "Generate one creative, production-ready music prompt for an AI music model.";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: "You write concise, vivid music generation prompts. Return plain text only.",
          },
          {
            role: "user",
            content: instruction,
          },
        ],
        max_output_tokens: 140,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return fallbackPrompt(seedPrompt);
    }

    const data = await response.json();
    const text = extractTextFromResponse(data);
    return text || fallbackPrompt(seedPrompt);
  } catch {
    return fallbackPrompt(seedPrompt);
  } finally {
    clearTimeout(timeout);
  }
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        Allow: "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  let seedPrompt = "";
  try {
    const body = JSON.parse(event.body || "{}");
    seedPrompt = sanitizeSeedPrompt(body.seedPrompt);
  } catch {
    seedPrompt = "";
  }

  const prompt = await openAIPrompt(seedPrompt);
  return jsonResponse(200, { prompt });
};
