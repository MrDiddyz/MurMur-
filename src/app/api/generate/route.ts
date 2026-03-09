import { NextRequest, NextResponse } from "next/server";

interface GenerateRequestBody {
  prompt?: unknown;
}

const MAX_PROMPT_LENGTH = 2_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const rateLimitStore = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    if (firstIp?.trim()) {
      return firstIp.trim();
    }
  }

  return "anonymous";
}

function isRateLimited(clientKey: string, now: number): boolean {
  const requests = rateLimitStore.get(clientKey) ?? [];
  const recentRequests = requests.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(clientKey, recentRequests);
    return true;
  }

  recentRequests.push(now);
  rateLimitStore.set(clientKey, recentRequests);
  return false;
}

function extractTextFromResponse(response: Record<string, unknown>): string {
  const output = response.output;
  if (!Array.isArray(output)) {
    return "";
  }

  const textParts: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      if (!part || typeof part !== "object") {
        continue;
      }

      const maybePart = part as { type?: unknown; text?: unknown };
      if (maybePart.type === "output_text" && typeof maybePart.text === "string") {
        textParts.push(maybePart.text);
      }
    }
  }

  return textParts.join("\n").trim();
}

export async function POST(request: NextRequest) {
  const now = Date.now();
  const clientIp = getClientIp(request);

  if (isRateLimited(clientIp, now)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again in a minute." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as GenerateRequestBody | null;

  if (!body || typeof body.prompt !== "string") {
    return NextResponse.json({ error: "Invalid input. `prompt` must be a string." }, { status: 400 });
  }

  const prompt = body.prompt.trim();

  if (!prompt) {
    return NextResponse.json({ error: "Invalid input. `prompt` is required." }, { status: 400 });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Invalid input. \`prompt\` must be <= ${MAX_PROMPT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfiguration. OPENAI_API_KEY is not set." },
      { status: 500 },
    );
  }

  try {
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: prompt,
      }),
    });

    if (!openAIResponse.ok) {
      const errorPayload = (await openAIResponse.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      const message = errorPayload?.error?.message ?? "Failed to generate output.";

      return NextResponse.json({ error: message }, { status: openAIResponse.status });
    }

    const data = (await openAIResponse.json()) as Record<string, unknown>;
    const result = extractTextFromResponse(data);

    return NextResponse.json({
      prompt,
      result,
      created_at: new Date(now).toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while generating output." },
      { status: 500 },
    );
  }
}
