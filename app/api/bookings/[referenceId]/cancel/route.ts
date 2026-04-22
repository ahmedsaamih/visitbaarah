import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, cancellationRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendCancellationRequestEmail } from "@/lib/plunk";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ referenceId: string }> }
) {
  try {
    const { referenceId } = await params;
    const { reason, email } = await request.json();

    if (!reason || !email) {
      return NextResponse.json({ error: "Reason and email are required" }, { status: 400 });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Verify booking exists
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.referenceId, referenceId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.guestEmail.toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2. Check if already cancelled or has pending request
    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    const existingRequest = await db.query.cancellationRequests.findFirst({
      where: and(
        eq(cancellationRequests.bookingId, booking.id),
        eq(cancellationRequests.status, "pending")
      ),
    });

    if (existingRequest) {
      return NextResponse.json({ error: "A cancellation request is already pending" }, { status: 400 });
    }

    // 3. Create Request
    await db.insert(cancellationRequests).values({
      bookingId: booking.id,
      reason,
      status: "pending",
    });

    // 4. Send Email
    try {
      await sendCancellationRequestEmail(booking.guestEmail, {
        guestName: booking.guestName,
        referenceId: booking.referenceId,
      });
    } catch (emailError) {
      console.error("[Cancellation API] Email failed:", emailError);
    }

    return NextResponse.json({ success: true, message: "Cancellation request submitted" });
  } catch (error) {
    console.error("[Cancellation API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
