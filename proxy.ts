
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {

    const token = request.cookies.get("next-auth.session-token")?.value || request.cookies.get("__Secure-next-auth.session-token")?.value;

    //if user is not logged in and tries to access dashboard
    if (!token) {
        if (request.nextUrl.pathname === "/login") {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    //if user is logged in and tries to access login or register
    if (token) {
        if (request.nextUrl.pathname === "/login") {
            return NextResponse.redirect(new URL("/shorten-url", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/shorten-url/:path*",
        "/login/:path*",
    ]
}