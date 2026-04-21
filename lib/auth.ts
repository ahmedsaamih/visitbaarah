import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

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
 * Hash a password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Create a signed session token using HMAC (Web Crypto API).
 */
async function signToken(payload: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const hexSignature = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${hexSignature}`;
}

/**
 * Verify a signed session token (Web Crypto API).
 */
async function verifyToken(token: string): Promise<string | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return null;

  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = token.substring(0, lastDot);
  const signatureHex = token.substring(lastDot + 1);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  try {
    const sigBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(payload)
    );

    return isValid ? payload : null;
  } catch {
    return null;
  }
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
  const token = await signToken(payload);

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

  const payload = await verifyToken(sessionCookie.value);
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
export async function verifySessionToken(token: string): Promise<boolean> {
  const payload = await verifyToken(token);
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
