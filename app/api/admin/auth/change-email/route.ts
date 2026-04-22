import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { verifyAndConsumeOTP } from "@/lib/otp";

export async function POST(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // 1. Verify OTP
    const isValid = await verifyAndConsumeOTP(normalizedEmail, code, "email_change");
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // 2. Update Setting
    await db
      .insert(settings)
      .values({
        key: "admin_recovery_email",
        value: normalizedEmail,
        group: "security",
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: normalizedEmail, updatedAt: new Date() },
      });

    return NextResponse.json({ success: true, message: "Recovery email updated successfully" });
  } catch (error) {
    console.error("[Change Email API] Error:", error);
    return NextResponse.json({ error: "Failed to update recovery email" }, { status: 500 });
  }
}
