import { db } from "@/db";
import { otps } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Generate a random 6-digit numeric OTP.
 */
export function generateNumericOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Save OTP to DB with expiration (default 15 mins).
 */
export async function saveOTP(email: string, code: string, type: "email_change" | "forgot_password") {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  // Keep one active OTP per email/type to avoid stale-code confusion.
  await db.delete(otps).where(and(eq(otps.email, email), eq(otps.type, type)));

  await db.insert(otps).values({
    email,
    code,
    type,
    expiresAt,
  });
}

/**
 * Verify OTP from DB and delete it if valid.
 */
export async function verifyAndConsumeOTP(email: string, code: string, type: "email_change" | "forgot_password"): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(otps)
    .where(
      and(
        eq(otps.email, email),
        eq(otps.code, code),
        eq(otps.type, type),
        gt(otps.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!existing) return false;

  // Consume only OTPs for this specific email/type.
  await db.delete(otps).where(and(eq(otps.email, email), eq(otps.type, type)));
  
  return true;
}
