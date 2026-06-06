import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/api/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p);

  if (pathname === "/login" && session) {
    const dest = session.mustChangePassword ? "/cambiar-password" : "/";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (!isPublic && !session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("redirect", pathname);
    return NextResponse.redirect(login);
  }

  if (
    session?.mustChangePassword &&
    pathname !== "/cambiar-password" &&
    pathname !== "/api/logout"
  ) {
    return NextResponse.redirect(new URL("/cambiar-password", request.url));
  }

  if (pathname === "/cambiar-password" && session && !session.mustChangePassword) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// /api/login must work without session
