import { NextResponse } from "next/server";
import { db } from "@/db";
import { businessInquiries, businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const { businessId, name, email, phone, message, preferredDate } = await request.json();

    if (!businessId || !name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name and message are required." }, { status: 400 });
    }
    if (!email?.trim() && !phone?.trim()) {
      return NextResponse.json({ error: "Please provide an email or phone number." }, { status: 400 });
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, Number(businessId)),
    });
    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    await db.insert(businessInquiries).values({
      businessId: Number(businessId),
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      message: message.trim(),
      preferredDate: preferredDate || null,
    });

    await sendTelegramNotification("inquiry_received", {
      businessName: business.name,
      senderName: name.trim(),
      senderContact: email?.trim() || phone?.trim() || "-",
      message: message.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Inquire API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
