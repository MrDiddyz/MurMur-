import { cookies, headers } from 'next/headers';

export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  return (
    cookieStore.get('murmur_user_id')?.value ??
    headerStore.get('x-murmur-user-id') ??
    process.env.DEV_FALLBACK_USER_ID ??
    null
  );
}
