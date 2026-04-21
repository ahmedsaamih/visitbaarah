import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateNumericOTP, saveOTP } from "@/lib/otp";
import { sendEmail } from "@/lib/plunk"; // Using the base sendEmail from plunk lib

export async function POST(request: Request) {
  try {
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json({ error: "Missing email or type" }, { status: 400 });
    }

    // 1. Verify if it's a forgot_password request, the email must match the admin recovery email
    if (type === "forgot_password") {
      const recoveryEmailSetting = await db.query.settings.findFirst({
        where: eq(settings.key, "admin_recovery_email"),
      });

      if (!recoveryEmailSetting || recoveryEmailSetting.value !== email) {
        // Obfuscate: don't reveal if email is wrong, just say "if it matches we sent it" 
        // But for admin-only portal, we can be more direct
        return NextResponse.json({ success: true, message: "If this email is registered, an OTP has been sent." });
      }
    }

    // 2. Generate and Save OTP
    const code = generateNumericOTP();
    await saveOTP(email, code, type);

    // 3. Send Email via Plunk
    const subject = type === "forgot_password" ? "Admin Password Reset OTP" : "Admin Email Change OTP";
    const body = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #0D5C5C;">Serene Admin Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0D5C5C; padding: 20px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
      </div>
    `;

    await sendEmail({ to: email, subject, body });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("[OTP API] Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
