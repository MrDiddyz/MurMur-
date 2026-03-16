import { NextResponse } from 'next/server';
import { projects } from '@/lib/vault/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') ?? 'murmur-archive-vault';
  const project = projects.find((entry) => entry.id === projectId) ?? projects[0];

  return NextResponse.json({
    projectId: project.id,
    title: project.title,
    brief: {
      vision: project.vision,
      problem: project.problem,
      user: project.user,
      features: project.features,
      nextSteps: project.nextSteps,
    },
  });
}
