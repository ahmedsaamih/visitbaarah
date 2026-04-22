import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendAdminNewBookingEmail } from "@/lib/plunk";
import { checkTransactionalRequestLimit, getTransactionalRetryMessage } from "@/lib/transactional-rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ referenceId: string }> }
) {
  try {
    const { referenceId } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.referenceId, referenceId),
      with: {
        roomType: true,
        addons: true,
        assignedRoom: true,
        cancellationRequests: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.guestEmail.toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("[Booking Lookup API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ referenceId: string }> }
) {
  try {
    const { referenceId } = await params;
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const nextCheckIn = typeof body?.checkIn === "string" ? body.checkIn : undefined;
    const nextCheckOut = typeof body?.checkOut === "string" ? body.checkOut : undefined;
    const nextGuests = body?.numGuests;
    const nextRooms = body?.numRooms;
    const nextRequests = typeof body?.specialRequests === "string" ? body.specialRequests : undefined;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.referenceId, referenceId),
      with: { roomType: true },
    });
    if (!booking || booking.guestEmail.toLowerCase() !== email) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "cancelled" || booking.status === "rejected" || booking.status === "checked_out") {
      return NextResponse.json({ error: "This booking can no longer be edited" }, { status: 400 });
    }

    const limit = checkTransactionalRequestLimit("booking_edit_request", email);
    if (!limit.allowed) {
      return NextResponse.json({ error: getTransactionalRetryMessage() }, { status: 429 });
    }

    const checkIn = nextCheckIn ?? booking.checkIn;
    const checkOut = nextCheckOut ?? booking.checkOut;
    if (checkIn >= checkOut) {
      return NextResponse.json({ error: "checkOut must be after checkIn" }, { status: 400 });
    }

    const numGuests = nextGuests !== undefined ? Number(nextGuests) : booking.numGuests;
    const numRooms = nextRooms !== undefined ? Number(nextRooms) : booking.numRooms;
    if (!Number.isInteger(numGuests) || numGuests < 1 || !Number.isInteger(numRooms) || numRooms < 1) {
      return NextResponse.json({ error: "Invalid guest/room counts" }, { status: 400 });
    }

    // Any guest edit requires admin re-approval, including already confirmed bookings.
    const [updated] = await db
      .update(bookings)
      .set({
        checkIn,
        checkOut,
        numGuests,
        numRooms,
        specialRequests: nextRequests ?? booking.specialRequests,
        status: "pending",
        assignedRoomId: null,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id))
      .returning();

    // Notify admin that a booking was edited and needs review.
    const totalAmountString = typeof updated.totalAmount === "string" ? updated.totalAmount : String(updated.totalAmount);
    const sent = await sendAdminNewBookingEmail({
      guestName: updated.guestName,
      guestEmail: updated.guestEmail,
      referenceId: updated.referenceId,
      roomType: booking.roomType?.name ?? "Room",
      checkIn: updated.checkIn,
      checkOut: updated.checkOut,
      totalAmount: `$${totalAmountString}`,
    });
    if (!sent) {
      console.error("[Booking Lookup API] Failed to send booking-edit admin notification.", { referenceId });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("[Booking Lookup API] PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
