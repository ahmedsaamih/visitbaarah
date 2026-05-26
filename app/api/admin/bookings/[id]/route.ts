import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, rooms, testimonials } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { sendBookingConfirmedEmail, sendBookingRejectedEmail, sendCheckoutReviewRequestEmail } from "@/lib/plunk";
import { checkTransactionalRequestLimit, getTransactionalRetryMessage } from "@/lib/transactional-rate-limit";
import { sendTelegramNotification } from "@/lib/telegram";
import { findAvailableRoomId } from "@/lib/room-assignment";

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

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: { roomType: true, business: true },
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
    if (status === "confirmed" && !nextAssignedRoomId && booking.roomTypeId) {
      nextAssignedRoomId = await findAvailableRoomId({
        excludeBookingId: booking.id,
        roomTypeId: booking.roomTypeId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      });
      if (!nextAssignedRoomId) {
        return NextResponse.json({ error: "No available room for selected dates. Please block/adjust booking dates." }, { status: 400 });
      }
    }

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

    const displayName = booking.roomType?.name ?? booking.business?.name ?? "Booking";

    if (status === "confirmed" && booking.status !== "confirmed") {
      let roomNumber;
      if (nextAssignedRoomId) {
        const room = await db.query.rooms.findFirst({ where: eq(rooms.id, nextAssignedRoomId) });
        roomNumber = room?.roomNumber;
      }

      const sent = await sendBookingConfirmedEmail(booking.guestEmail, {
        guestName: booking.guestName,
        referenceId: booking.referenceId,
        roomType: displayName,
        roomNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      });
      if (!sent) {
        console.error("[Admin Booking Update API] Confirmation email failed.", { bookingId, referenceId: booking.referenceId });
      }

      await sendTelegramNotification("booking_confirmed", {
        referenceId: booking.referenceId,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        roomType: displayName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      });
    } else if (status === "rejected" && booking.status !== "rejected") {
      const sent = await sendBookingRejectedEmail(booking.guestEmail, {
        guestName: booking.guestName,
        referenceId: booking.referenceId,
        reason: rejectionReason,
      });
      if (!sent) {
        console.error("[Admin Booking Update API] Rejection email failed.", { bookingId, referenceId: booking.referenceId });
      }

      await sendTelegramNotification("booking_rejected", {
        referenceId: booking.referenceId,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        reason: rejectionReason,
      });
    } else if (status === "checked_out" && booking.status !== "checked_out") {
      const existingReview = await db.query.testimonials.findFirst({
        where: eq(testimonials.bookingId, booking.id),
      });

      const reviewToken = crypto.randomUUID().replace(/-/g, "");
      const reviewTokenExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const stayDate = booking.checkOut;

      let reviewId = existingReview?.id;
      if (existingReview) {
        const [updatedReview] = await db
          .update(testimonials)
          .set({
            guestName: booking.guestName,
            guestCountry: booking.guestCountry || existingReview.guestCountry,
            stayDate,
            reviewStatus: "pending",
            isPublished: false,
            reviewToken,
            reviewTokenExpiresAt,
            reviewSubmittedAt: null,
          })
          .where(eq(testimonials.id, existingReview.id))
          .returning();
        reviewId = updatedReview?.id;
      } else {
        const [createdReview] = await db
          .insert(testimonials)
          .values({
            bookingId: booking.id,
            guestName: booking.guestName,
            guestCountry: booking.guestCountry,
            rating: 5,
            content: "",
            stayDate,
            reviewStatus: "pending",
            isPublished: false,
            reviewToken,
            reviewTokenExpiresAt,
          })
          .returning();
        reviewId = createdReview?.id;
      }

      if (reviewId) {
        const sent = await sendCheckoutReviewRequestEmail(booking.guestEmail, {
          guestName: booking.guestName,
          referenceId: booking.referenceId,
          reviewToken,
          roomType: displayName,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        });
        if (!sent) {
          console.error("[Admin Booking Update API] Review invitation email failed.", { bookingId, referenceId: booking.referenceId });
        }
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("[Admin Booking Update API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
