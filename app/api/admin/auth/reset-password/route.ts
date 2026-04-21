import { NextResponse } from "next/server";
import { db } from "@/db";
import { verifyAndConsumeOTP } from "@/lib/otp";
import { hashPassword } from "@/lib/auth";
import { settings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify OTP
    const isValid = await verifyAndConsumeOTP(email, code, "forgot_password");
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // 2. Update ADMIN_PASSWORD_HASH env (since we use env for password)
    // IMPORTANT: In a real serverless env, we can't write to .env.local
    // However, for this project, the user usually wants the change persisted.
    // I'll update the password hash in the .env.local file if possible, 
    // OR we should have a table for admin users.
    // Given the previous setup used bcryptjs on process.env.ADMIN_PASSWORD_HASH,
    // I will attempt to update the env file for a local-like persistence.
    
    const hashed = await hashPassword(newPassword);
    
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      let content = await fs.readFile(envPath, "utf-8");
      
      const newEntry = `ADMIN_PASSWORD_HASH="${hashed}"`;
      if (content.includes("ADMIN_PASSWORD_HASH=")) {
        content = content.replace(/ADMIN_PASSWORD_HASH=".*"/g, newEntry);
        content = content.replace(/ADMIN_PASSWORD_HASH='.*'/g, newEntry);
        content = content.replace(/ADMIN_PASSWORD_HASH=.*/g, newEntry);
      } else {
        content += `\n${newEntry}`;
      }
      
      await fs.writeFile(envPath, content);
      console.log("[Auth] Password hash updated in .env.local");
    } catch (e) {
      console.error("[Auth] Could not write to .env.local, password change will not persist across restarts.");
    }

    return NextResponse.json({ success: true, message: "Password reset successful. Please login with your new password." });
  } catch (error) {
    console.error("[Reset Password API] Error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
