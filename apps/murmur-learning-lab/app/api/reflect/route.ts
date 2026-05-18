import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/ai';
import { createServerClient } from '@/lib/supabase';
import type { Reflection, LearningNode } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { content?: string };
    const content = body.content?.trim();

    if (!content || content.length < 10) {
      return NextResponse.json(
        { error: 'Reflection must be at least 10 characters.' },
        { status: 400 },
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Reflection must be under 5000 characters.' },
        { status: 400 },
      );
    }

    // 1. Get AI response
    const ai = await getAIResponse(content);

    // 2. Save reflection to Supabase
    const db = createServerClient();

    const { data: reflectionRow, error: reflectionError } = await db
      .from('reflections')
      .insert({
        content,
        mirror: ai.mirror,
        insight: ai.insight,
        next_step: ai.next_step,
        creative_suggestion: ai.creative_suggestion,
      })
      .select()
      .single<Reflection>();

    if (reflectionError) {
      console.error('Supabase insert error (reflection):', reflectionError);
      return NextResponse.json(
        { error: 'Failed to save reflection.' },
        { status: 500 },
      );
    }

    // 3. Create a learning node from the reflection
    const nodeTitle = content.split(/[.!?]/)[0]?.slice(0, 80).trim() || 'Reflection';
    const nodeSummary = ai.insight;
    const nodeTags = extractTags(content);

    const { data: nodeRow, error: nodeError } = await db
      .from('learning_nodes')
      .insert({
        reflection_id: reflectionRow.id,
        title: nodeTitle,
        summary: nodeSummary,
        tags: nodeTags,
      })
      .select()
      .single<LearningNode>();

    if (nodeError) {
      console.error('Supabase insert error (node):', nodeError);
      // Non-fatal: return reflection even if node fails
    }

    return NextResponse.json({
      reflection: reflectionRow,
      node: nodeRow ?? null,
      ai,
    });
  } catch (err) {
    console.error('Reflect API error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}

/** Extract simple tags from content (first few significant words). */
function extractTags(content: string): string[] {
  const stopWords = new Set([
    'i', 'me', 'my', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on',
    'at', 'to', 'for', 'of', 'it', 'is', 'was', 'are', 'be', 'been',
    'have', 'has', 'had', 'do', 'did', 'that', 'this', 'with', 'from',
  ]);

  return content
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, 5);
}
