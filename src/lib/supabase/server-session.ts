import { cookies, headers } from 'next/headers';

import { ACCESS_TOKEN_COOKIE, readUserFromAccessToken } from '@/lib/supabase/auth';

export async function getServerSessionUser() {
  const headerStore = headers();
  const middlewareUserId = headerStore.get('x-user-id');
  const middlewareEmail = headerStore.get('x-user-email') ?? undefined;

  if (middlewareUserId) {
    return {
      userId: middlewareUserId,
      email: middlewareEmail,
    };
  }

  const cookieStore = cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  return readUserFromAccessToken(accessToken);
}
