import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, rooms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { sendBookingConfirmedEmail, sendBookingRejectedEmail } from "@/lib/plunk";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const bookingId = parseInt(id);

  try {
    const data = await request.json();
    const { status, assignedRoomId, rejectionReason, adminNotes } = data;

    // 1. Get current booking
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: { roomType: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2. Update Booking
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: status || booking.status,
        assignedRoomId: assignedRoomId === undefined ? booking.assignedRoomId : assignedRoomId,
        rejectionReason: rejectionReason || booking.rejectionReason,
        adminNotes: adminNotes || booking.adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // 3. Side effects (Emails + Room Status)
    if (status === "confirmed" && booking.status !== "confirmed") {
      // Send confirmation email
      let roomNumber;
      if (assignedRoomId) {
        const room = await db.query.rooms.findFirst({
          where: eq(rooms.id, assignedRoomId),
        });
        roomNumber = room?.roomNumber;
      }

      await sendBookingConfirmedEmail(booking.guestEmail, {
        guestName: booking.guestName,
        referenceId: booking.referenceId,
        roomType: booking.roomType?.name ?? "Room",
        roomNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      });
    } else if (status === "rejected" && booking.status !== "rejected") {
      // Send rejection email
      await sendBookingRejectedEmail(booking.guestEmail, {
        guestName: booking.guestName,
        referenceId: booking.referenceId,
        reason: rejectionReason,
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("[Admin Booking Update API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
