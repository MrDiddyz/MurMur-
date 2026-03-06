import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  cookies().delete("sb-access-token")
  const url = new URL("/login", request.url)
  return NextResponse.redirect(url)
}
