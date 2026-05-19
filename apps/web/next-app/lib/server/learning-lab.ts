import { getEnv } from '@/lib/server/env';

export type ReflectionRecord = {
  id: string;
  content: string;
  mirror: string;
  insight: string;
  next_step: string;
  creative_suggestion: string;
  created_at: string;
};

export type LearningNodeRecord = {
  id: string;
  reflection_id: string;
  title: string;
  summary: string;
  next_action: string;
  created_at: string;
};

export type ReflectionWithNode = {
  reflection: ReflectionRecord;
  node: LearningNodeRecord | null;
};

type AiReflectionResponse = {
  mirror: string;
  insight: string;
  nextStep: string;
  creativeSuggestion: string;
};

const MAX_TITLE_WORDS = 6;
const MIN_REFLECTION_LENGTH = 20;
const NEXT_STEP_WINDOW_HOURS = 24;
const NEXT_STEP_DURATION_MINUTES = 10;
const DEFAULT_REFLECTION_LIMIT = 6;
const DEFAULT_NODE_LIMIT = 12;
const MAX_QUERY_LIMIT = 100;
const MIN_QUERY_LIMIT = 1;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSupabaseConfig() {
  return {
    supabaseUrl: getEnv('SUPABASE_URL'),
    supabaseServiceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return (await response.json()) as T;
}

function buildMirror(text: string): string {
  const first = text.split(/[.!?\n\r]/).find((part) => part.trim().length > 0)?.trim() ?? text.trim();
  return `You are noticing that "${first}" matters deeply to you right now.`;
}

function buildInsight(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('stuck') || lower.includes('stress') || lower.includes('overwhelmed')) {
    return 'A recurring signal is pressure without enough recovery space, so your learning edge is in simplifying focus.';
  }
  if (lower.includes('excited') || lower.includes('curious') || lower.includes('energy')) {
    return 'Your reflection shows momentum; your learning edge is to channel that energy into one repeatable habit.';
  }
  return 'Your reflection points to a transition moment; your learning edge is turning awareness into a small repeatable step.';
}

function buildNextStep(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const anchor = words.slice(0, 4).join(' ');
  return `In the next ${NEXT_STEP_WINDOW_HOURS} hours, take ${NEXT_STEP_DURATION_MINUTES} focused minutes to act on "${
    anchor || 'this reflection'
  }" and write what changed.`;
}

function buildCreativeSuggestion(text: string): string {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return `Create a 3-point constellation sketch: one star for today (${wordCount} words captured), one for your key insight, and one for your next experiment.`;
}

function generateAiReflection(text: string): AiReflectionResponse {
  return {
    mirror: buildMirror(text),
    insight: buildInsight(text),
    nextStep: buildNextStep(text),
    creativeSuggestion: buildCreativeSuggestion(text),
  };
}

function makeNodeTitle(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).slice(0, MAX_TITLE_WORDS);
  return words.length > 0 ? words.join(' ') : 'Untitled reflection';
}

export async function createReflectionAndNode(rawContent: string): Promise<ReflectionWithNode> {
  const content = rawContent.trim();
  if (content.length < MIN_REFLECTION_LENGTH) {
    throw new Error(`Please write at least ${MIN_REFLECTION_LENGTH} characters so the reflection has enough context.`);
  }

  const ai = generateAiReflection(content);
  const reflectionRows = await supabaseRequest<ReflectionRecord[]>('reflections', {
    method: 'POST',
    body: JSON.stringify([
      {
        content,
        mirror: ai.mirror,
        insight: ai.insight,
        next_step: ai.nextStep,
        creative_suggestion: ai.creativeSuggestion,
      },
    ]),
  });

  const reflection = reflectionRows[0];
  const nodeRows = await supabaseRequest<LearningNodeRecord[]>('learning_nodes', {
    method: 'POST',
    body: JSON.stringify([
      {
        reflection_id: reflection.id,
        title: makeNodeTitle(content),
        summary: ai.insight,
        next_action: ai.nextStep,
      },
    ]),
  });

  return { reflection, node: nodeRows[0] ?? null };
}

function normalizeLimit(limit: number, fallback: number): number {
  if (!Number.isFinite(limit)) {
    return fallback;
  }

  const normalized = Math.trunc(limit);
  if (normalized < MIN_QUERY_LIMIT) {
    return MIN_QUERY_LIMIT;
  }

  if (normalized > MAX_QUERY_LIMIT) {
    return MAX_QUERY_LIMIT;
  }

  return normalized;
}

export async function listRecentReflections(limit = DEFAULT_REFLECTION_LIMIT): Promise<ReflectionRecord[]> {
  const safeLimit = normalizeLimit(limit, DEFAULT_REFLECTION_LIMIT);
  return supabaseRequest<ReflectionRecord[]>(
    `reflections?select=*&order=created_at.desc&limit=${encodeURIComponent(String(safeLimit))}`,
    { headers: { Prefer: 'return=representation' } },
  );
}

export async function listRecentNodes(limit = DEFAULT_NODE_LIMIT): Promise<LearningNodeRecord[]> {
  const safeLimit = normalizeLimit(limit, DEFAULT_NODE_LIMIT);
  return supabaseRequest<LearningNodeRecord[]>(
    `learning_nodes?select=*&order=created_at.desc&limit=${encodeURIComponent(String(safeLimit))}`,
    { headers: { Prefer: 'return=representation' } },
  );
}

export async function getReviewSnapshot(reflectionId?: string): Promise<ReflectionWithNode | null> {
  const validReflectionId = reflectionId && UUID_PATTERN.test(reflectionId) ? reflectionId : undefined;
  const query = validReflectionId
    ? `reflections?id=eq.${encodeURIComponent(validReflectionId)}&select=*&limit=1`
    : 'reflections?select=*&order=created_at.desc&limit=1';

  const reflections = await supabaseRequest<ReflectionRecord[]>(query, { headers: { Prefer: 'return=representation' } });
  const reflection = reflections[0];
  if (!reflection) {
    return null;
  }

  const nodes = await supabaseRequest<LearningNodeRecord[]>(
    `learning_nodes?reflection_id=eq.${encodeURIComponent(reflection.id)}&select=*&order=created_at.desc&limit=1`,
    { headers: { Prefer: 'return=representation' } },
  );

  return { reflection, node: nodes[0] ?? null };
}
