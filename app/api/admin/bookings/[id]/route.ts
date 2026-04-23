import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, rooms, roomAvailability } from "@/db/schema";
import { eq, and, ne, gte, lt, inArray } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { sendBookingConfirmedEmail, sendBookingRejectedEmail } from "@/lib/plunk";
import { checkTransactionalRequestLimit, getTransactionalRetryMessage } from "@/lib/transactional-rate-limit";
import { sendTelegramNotification } from "@/lib/telegram";

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

    const willSendConfirmation = status === "confirmed" && booking.status !== "confirmed";
    const willSendRejection = status === "rejected" && booking.status !== "rejected";
    if (willSendConfirmation || willSendRejection) {
      const action = willSendConfirmation ? "admin_confirm_booking" : "admin_reject_booking";
      const limit = checkTransactionalRequestLimit(action, booking.guestEmail);
      if (!limit.allowed) {
        return NextResponse.json({ error: getTransactionalRetryMessage() }, { status: 429 });
      }
    }

    let nextAssignedRoomId = assignedRoomId === undefined ? booking.assignedRoomId : assignedRoomId;
    if (status === "confirmed" && !nextAssignedRoomId) {
      if (!booking.roomTypeId) {
        return NextResponse.json({ error: "Booking has no room type and cannot be confirmed." }, { status: 400 });
      }
      nextAssignedRoomId = await findAvailableRoomId(booking);
      if (!nextAssignedRoomId) {
        return NextResponse.json({ error: "No available room for selected dates. Please block/adjust booking dates." }, { status: 400 });
      }
    }

    // 2. Update Booking
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: status || booking.status,
        assignedRoomId: nextAssignedRoomId,
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
      if (nextAssignedRoomId) {
        const room = await db.query.rooms.findFirst({
          where: eq(rooms.id, nextAssignedRoomId),
        });
        roomNumber = room?.roomNumber;
      }

      const sent = await sendBookingConfirmedEmail(booking.guestEmail, {
        guestName: booking.guestName,
        referenceId: booking.referenceId,
        roomType: booking.roomType?.name ?? "Room",
        roomNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      });
      if (!sent) {
        console.error("[Admin Booking Update API] Confirmation email failed to send.", {
          bookingId,
          referenceId: booking.referenceId,
        });
      }

      await sendTelegramNotification("booking_confirmed", {
        referenceId: booking.referenceId,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        roomType: booking.roomType?.name ?? "Room",
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      });
    } else if (status === "rejected" && booking.status !== "rejected") {
      // Send rejection email
      const sent = await sendBookingRejectedEmail(booking.guestEmail, {
        guestName: booking.guestName,
        referenceId: booking.referenceId,
        reason: rejectionReason,
      });
      if (!sent) {
        console.error("[Admin Booking Update API] Rejection email failed to send.", {
          bookingId,
          referenceId: booking.referenceId,
        });
      }

      await sendTelegramNotification("booking_rejected", {
        referenceId: booking.referenceId,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        reason: rejectionReason,
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("[Admin Booking Update API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function findAvailableRoomId(booking: {
  id: number;
  roomTypeId: number | null;
  checkIn: string;
  checkOut: string;
}) {
  if (!booking.roomTypeId) return null;

  const candidateRooms = await db.query.rooms.findMany({
    where: eq(rooms.roomTypeId, booking.roomTypeId),
  });
  if (candidateRooms.length === 0) return null;

  const roomIds = candidateRooms.map((room) => room.id);

  const blockedRows = await db.query.roomAvailability.findMany({
    where: and(
      inArray(roomAvailability.roomId, roomIds),
      eq(roomAvailability.isBlocked, true),
      gte(roomAvailability.date, booking.checkIn),
      lt(roomAvailability.date, booking.checkOut)
    ),
  });
  const blockedRoomIds = new Set(blockedRows.map((row) => row.roomId));

  for (const room of candidateRooms) {
    if (blockedRoomIds.has(room.id)) continue;

    const overlap = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.assignedRoomId, room.id),
        ne(bookings.id, booking.id),
        ne(bookings.status, "cancelled"),
        ne(bookings.status, "rejected"),
        ne(bookings.status, "checked_out"),
        lt(bookings.checkIn, booking.checkOut),
        gte(bookings.checkOut, incrementDateString(booking.checkIn))
      ),
    });
    if (!overlap) return room.id;
  }

  return null;
}

function incrementDateString(dateStr: string) {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split("T")[0];
}
