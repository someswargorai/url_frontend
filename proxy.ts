import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  const cookie = await cookies();
  const token =
    cookie.get("next-auth.session-token")?.value ||
    cookie.get("__Secure-next-auth.session-token")?.value;

  const { pathname } = request.nextUrl;

  if (!token) {
    if (pathname.startsWith("/login")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/shorten-url", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/shorten-url/:path*",
    "/login",
    "/show-stats/:path*",
    "/urls/:path*",
    "/projects/:path*",
    "/subscription/:path*",
    "/success/:path*",
    "/documentation/:path*",
    "/campaigns/:path*",
    "/apikey/:path*",
    "/custom-domains/:path*",
  ],
};
