import { NextResponse, type NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/supabase";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("murmur-access-token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await getUserFromToken(accessToken);

  if (!user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("murmur-access-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
