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
  const first = text.split(/[\n.!?]/).find((part) => part.trim().length > 0)?.trim() ?? text.trim();
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
  return `In the next 24 hours, take 10 focused minutes to act on "${anchor || 'this reflection'}" and write what changed.`;
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
  const words = content.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  return words.length > 0 ? words.join(' ') : 'Untitled reflection';
}

export async function createReflectionAndNode(rawContent: string): Promise<ReflectionWithNode> {
  const content = rawContent.trim();
  if (content.length < 20) {
    throw new Error('Please write at least 20 characters so the reflection has enough context.');
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

export async function listRecentReflections(limit = 6): Promise<ReflectionRecord[]> {
  return supabaseRequest<ReflectionRecord[]>(
    `reflections?select=*&order=created_at.desc&limit=${encodeURIComponent(String(limit))}`,
    { headers: { Prefer: 'return=representation' } },
  );
}

export async function listRecentNodes(limit = 12): Promise<LearningNodeRecord[]> {
  return supabaseRequest<LearningNodeRecord[]>(
    `learning_nodes?select=*&order=created_at.desc&limit=${encodeURIComponent(String(limit))}`,
    { headers: { Prefer: 'return=representation' } },
  );
}

export async function getReviewSnapshot(reflectionId?: string): Promise<ReflectionWithNode | null> {
  const query = reflectionId
    ? `reflections?id=eq.${encodeURIComponent(reflectionId)}&select=*&limit=1`
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
