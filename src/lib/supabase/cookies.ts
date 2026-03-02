import { type NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/supabase/auth';

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string, expiresIn = 3600) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: expiresIn,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
}
