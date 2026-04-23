import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST() {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendTelegramNotification("test", {});
  if (!result.sent) {
    return NextResponse.json(
      { error: result.reason || "Telegram test failed", skipped: result.skipped || false },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, message: "Telegram test sent successfully." });
}
