import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateNumericOTP, saveOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/plunk";

type OTPRequestType = "forgot_password" | "email_change";

export async function POST(request: Request) {
  try {
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json({ error: "Missing email or type" }, { status: 400 });
    }

    if (type !== "forgot_password" && type !== "email_change") {
      return NextResponse.json({ error: "Invalid OTP type" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // 1. Verify if it's a forgot_password request
    if (type === "forgot_password") {
      const recoveryEmailSetting = await db.query.settings.findFirst({
        where: eq(settings.key, "admin_recovery_email"),
      });

      if (!recoveryEmailSetting || recoveryEmailSetting.value.toLowerCase() !== normalizedEmail) {
        return NextResponse.json({ success: true, message: "If this email is registered, an OTP has been sent." });
      }
    }

    // 2. Generate and Save OTP
    const code = generateNumericOTP();
    await saveOTP(normalizedEmail, code, type as OTPRequestType);

    // 3. Send Branded Email via Plunk
    const sent = await sendOTPEmail(normalizedEmail, { code, type });
    if (!sent) {
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("[OTP API] Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
