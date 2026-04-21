import { NextResponse } from "next/server";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

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
