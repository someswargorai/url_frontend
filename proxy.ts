import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {

    const cookie = await cookies();
    const token = cookie.get("next-auth.session-token")?.value || cookie.get("__Secure-next-auth.session-token")?.value;

    const { pathname } = request.nextUrl;

    if (!token && pathname.startsWith("/shorten-url")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    console.log("isAuth", cookie, pathname);
    if (token && pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/shorten-url", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/shorten-url/:path*", "/login"],
};