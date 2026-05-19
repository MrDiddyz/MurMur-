'use server';

import { redirect } from 'next/navigation';
import { createReflectionAndNode } from '@/lib/server/learning-lab';

export async function submitReflection(formData: FormData) {
  const content = String(formData.get('content') ?? '');

  try {
    const { reflection } = await createReflectionAndNode(content);
    redirect(`/review?reflectionId=${reflection.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not process reflection. Please try again.';
    redirect(`/reflection?error=${encodeURIComponent(message)}`);
  }
}
