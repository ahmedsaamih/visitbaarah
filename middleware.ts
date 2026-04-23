import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth";

const SESSION_COOKIE = "admin_session";

// In-memory rate limiting (simple implementation for edge)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

  // 1. Rate limiting for OTP route (login has failed-attempt limiter in route handler)
  if (pathname.startsWith("/api/admin/auth/otp") && request.method === "POST") {
    const now = Date.now();
    const limit = 5; // max 5 attempts
    const window = 60 * 1000; // per 1 minute

    const stats = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - stats.lastReset > window) {
      stats.count = 1;
      stats.lastReset = now;
    } else {
      stats.count++;
    }

    rateLimitMap.set(ip, stats);

    if (stats.count > limit) {
      return new NextResponse(JSON.stringify({ error: "Too many requests. Please try again in a minute." }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  const response = pathname.startsWith("/admin") && pathname !== "/admin/login"
    ? await handleAdminAuth(request)
    : NextResponse.next();

  // 2. Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.jquery.com https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https://*.public.blob.vercel-storage.com; " +
    "connect-src 'self' https://api.useplunk.com;"
  );

  return response;
}

async function handleAdminAuth(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (!sessionCookie?.value || !(await verifySessionToken(sessionCookie.value))) {
    const loginUrl = new URL("/admin/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    // Clear invalid cookie
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
