import { NextResponse } from "next/server";
import { verifyPassword, createSession } from "@/lib/auth";

type AttemptState = { count: number; lastFailedAt: number; lockUntil?: number };

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 60 * 1000;
const LOGIN_LOCK_MS = 60 * 1000;

// In-memory limiter; counts failed password attempts only and resets on success.
const loginAttempts = new Map<string, AttemptState>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "anonymous";
}

function getLockMessage(lockUntil: number): string {
  const seconds = Math.max(1, Math.ceil((lockUntil - Date.now()) / 1000));
  return `Too many failed attempts. Try again in ${seconds}s.`;
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const now = Date.now();
    const current = loginAttempts.get(ip);

    if (current?.lockUntil && now < current.lockUntil) {
      console.warn("[Login API] Too many attempts for IP", ip);
      return NextResponse.json(
        { error: getLockMessage(current.lockUntil) },
        { status: 429 }
      );
    }

    const isValid = await verifyPassword(password);

    if (!isValid) {
      const withinWindow = !!current && now - current.lastFailedAt <= LOGIN_WINDOW_MS;
      const failedCount = withinWindow ? current.count + 1 : 1;
      const next: AttemptState = { count: failedCount, lastFailedAt: now };

      if (failedCount >= LOGIN_LIMIT) {
        next.lockUntil = now + LOGIN_LOCK_MS;
        console.warn("[Login API] Too many failed attempts for IP", ip);
      } else {
        console.warn("[Login API] Invalid password attempt");
      }

      loginAttempts.set(ip, next);

      if (next.lockUntil) {
        return NextResponse.json(
          { error: getLockMessage(next.lockUntil) },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Successful login clears any stale failed-attempt history.
    loginAttempts.delete(ip);
    await createSession();

    return NextResponse.json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    console.error("[Login API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
