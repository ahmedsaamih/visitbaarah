import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_EXPIRY_HOURS = 24;

/**
 * Verify a password against the stored admin hash.
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed session token using HMAC.
 */
function signToken(payload: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return `${payload}.${hmac.digest("hex")}`;
}

/**
 * Verify a signed session token.
 */
function verifyToken(token: string): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return null;

  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = token.substring(0, lastDot);
  const signature = token.substring(lastDot + 1);

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expected = hmac.digest("hex");

  // Timing-safe comparison
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  return payload;
}

/**
 * Create a new admin session (set cookie).
 * Call from Route Handler or Server Action only.
 */
export async function createSession(): Promise<void> {
  const expiresAt = Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
  const payload = JSON.stringify({
    role: "admin",
    exp: expiresAt,
    iat: Date.now(),
  });
  const token = signToken(payload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
  });
}

/**
 * Verify the current admin session from cookies.
 * Returns true if the session is valid and not expired.
 */
export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  if (!sessionCookie?.value) return false;

  const payload = verifyToken(sessionCookie.value);
  if (!payload) return false;

  try {
    const data = JSON.parse(payload);
    if (data.role !== "admin") return false;
    if (Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify a session token string directly (for middleware use).
 * Does not read from cookies — pass the token value.
 */
export function verifySessionToken(token: string): boolean {
  const payload = verifyToken(token);
  if (!payload) return false;

  try {
    const data = JSON.parse(payload);
    if (data.role !== "admin") return false;
    if (Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Destroy the admin session (clear cookie).
 * Call from Route Handler or Server Action only.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
