import { NextResponse, type NextRequest } from "next/server";

// Must match SESSION_COOKIE_NAME in lib/auth/session.ts
const SESSION_COOKIE = "meusdesafios-session";

const protectedRoutes = ["/today", "/explore", "/leaderboard", "/profile", "/settings"];
const authOnlyRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF protection: verify Origin on API mutation requests
  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)
  ) {
    const origin = request.headers.get("origin");
    if (origin) {
      const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const allowedOrigin = new URL(appUrl).origin;
      if (origin !== allowedOrigin) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Invalid origin" } },
          { status: 403 }
        );
      }
    }
  }

  // Pass through API routes, static files, Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isLoggedIn = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const wantsProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthPage = authOnlyRoutes.includes(pathname);

  // Not logged in → redirect to login
  if (wantsProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → redirect away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  // Root redirect
  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
