import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token",
    });

    const isAuth = !!token;
    const { pathname } = request.nextUrl;

    if (!isAuth && pathname.startsWith("/shorten-url")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuth && pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/shorten-url", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/shorten-url/:path*", "/login/:path*"],
};