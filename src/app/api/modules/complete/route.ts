import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase-admin';

type BadgeCriteria = {
  required_modules?: string[];
};

type BadgeRow = {
  id: string;
  criteria: BadgeCriteria | null;
};

type ModuleProgressRow = {
  module_id: string;
};

export async function POST(req: Request) {
  const { userId, moduleId } = await req.json();

  if (!userId || !moduleId) {
    return NextResponse.json({ error: 'userId and moduleId are required.' }, { status: 400 });
  }

  const { error: moduleProgressError } = await supabaseAdmin.from('module_progress').upsert({
    user_id: userId,
    module_id: moduleId,
    completed_at: new Date().toISOString(),
  });

  if (moduleProgressError) {
    return NextResponse.json({ error: moduleProgressError.message }, { status: 500 });
  }

  const { data: badges, error: badgesError } = await supabaseAdmin.from('badges').select('*');

  if (badgesError) {
    return NextResponse.json({ error: badgesError.message }, { status: 500 });
  }

  const { data: completed, error: completedError } = await supabaseAdmin
    .from('module_progress')
    .eq('user_id', userId)
    .select('module_id');

  if (completedError) {
    return NextResponse.json({ error: completedError.message }, { status: 500 });
  }

  const completedModules = new Set((completed as ModuleProgressRow[] | null)?.map((item) => item.module_id) ?? []);

  for (const badge of (badges as BadgeRow[] | null) ?? []) {
    const criteria = badge.criteria ?? {};
    const requiredModules = criteria.required_modules ?? [];
    const eligible = requiredModules.every((requiredModuleId) => completedModules.has(requiredModuleId));

    if (!eligible) {
      continue;
    }

    const { error: awardError } = await supabaseAdmin.from('user_badges').upsert({
      user_id: userId,
      badge_id: badge.id,
      awarded_at: new Date().toISOString(),
    });

    if (awardError) {
      return NextResponse.json({ error: awardError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
