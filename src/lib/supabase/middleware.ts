import { NextResponse, type NextRequest } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  readUserFromAccessToken,
  refreshSession,
} from '@/lib/supabase/auth';
import { clearAuthCookies } from '@/lib/supabase/cookies';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export async function updateSupabaseSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  if (!hasSupabaseEnv) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const accessUser = readUserFromAccessToken(accessToken);
  if (accessUser) {
    requestHeaders.set('x-user-id', accessUser.userId);
    if (accessUser.email) {
      requestHeaders.set('x-user-email', accessUser.email);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (!refreshToken) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  try {
    const refreshed = await refreshSession(refreshToken);
    const refreshedUser = readUserFromAccessToken(refreshed.access_token);
    if (refreshedUser) {
      requestHeaders.set('x-user-id', refreshedUser.userId);
      if (refreshedUser.email) {
        requestHeaders.set('x-user-email', refreshedUser.email);
      }
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.access_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: refreshed.expires_in,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refresh_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    clearAuthCookies(response);
    return response;
  }
}
