import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: Record<string, unknown>) {
          request.cookies.set({ name, value, ...(options || {}) });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...(options || {}) });
        },
        remove(name: string, options?: Record<string, unknown>) {
          request.cookies.set({ name, value: "", ...(options || {}) });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: "", ...(options || {}) });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPath = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/auth/");
  const isAppPath =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/scenarios") ||
    request.nextUrl.pathname.startsWith("/baselines") ||
    request.nextUrl.pathname.startsWith("/settings");

  if (!user && isAppPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
