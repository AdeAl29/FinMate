import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  PUBLIC_API_ROUTES,
  PUBLIC_ROUTES,
} from "@/lib/constants";
import { verifyToken } from "@/lib/jwt";

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route);
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_ROUTES.some((route) => pathname === route);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isTokenValid = token ? Boolean(await verifyToken(token)) : false;

  if (pathname.startsWith("/api")) {
    if (isPublicApi(pathname)) {
      return NextResponse.next();
    }

    if (!isTokenValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    if (isTokenValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isTokenValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
