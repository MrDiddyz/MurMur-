import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase-admin';

type ModuleRow = {
  id: string;
  prerequisite_module_id: string | null;
};

type ModuleProgressRow = {
  module_id: string;
};

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'x-user-id header is required.' }, { status: 400 });
  }

  const { data: modules, error: modulesError } = await supabaseAdmin.from('modules').select('*');

  if (modulesError) {
    return NextResponse.json({ error: modulesError.message }, { status: 500 });
  }

  const { data: completed, error: completedError } = await supabaseAdmin
    .from('module_progress')
    .eq('user_id', userId)
    .select('module_id');

  if (completedError) {
    return NextResponse.json({ error: completedError.message }, { status: 500 });
  }

  const completedIds = new Set((completed as ModuleProgressRow[] | null)?.map((item) => item.module_id) ?? []);

  const unlockedModules = ((modules as ModuleRow[] | null) ?? []).filter((module) => {
    if (!module.prerequisite_module_id) {
      return true;
    }

    return completedIds.has(module.prerequisite_module_id);
  });

  const { data: badges, error: badgesError } = await supabaseAdmin
    .from('user_badges')
    .eq('user_id', userId)
    .select('*');

  if (badgesError) {
    return NextResponse.json({ error: badgesError.message }, { status: 500 });
  }

  return NextResponse.json({ unlockedModules, badges });
}
