import { NextResponse } from "next/server";
import { db } from "@/db";
import { cancellationRequests, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { sendCancellationApprovedEmail, sendCancellationRejectedEmail } from "@/lib/plunk";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const requestId = parseInt(id);

  try {
    const { status, adminResponse } = await request.json();

    // 1. Get request
    const cancelReq = await db.query.cancellationRequests.findFirst({
      where: eq(cancellationRequests.id, requestId),
      with: { booking: true },
    });

    if (!cancelReq) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (cancelReq.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    // 2. Update status and Resolve
    const [updatedReq] = await db.transaction(async (tx) => {
      const [res] = await tx
        .update(cancellationRequests)
        .set({
          status,
          adminResponse,
          resolvedAt: new Date(),
        })
        .where(eq(cancellationRequests.id, requestId))
        .returning();

      // If approved, update booking status
      if (status === "approved") {
        await tx
          .update(bookings)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(bookings.id, cancelReq.bookingId));
      }

      return [res];
    });

    // 3. Emails
    if (status === "approved") {
      await sendCancellationApprovedEmail(cancelReq.booking.guestEmail, {
        guestName: cancelReq.booking.guestName,
        referenceId: cancelReq.booking.referenceId,
      });
    } else if (status === "rejected") {
      await sendCancellationRejectedEmail(cancelReq.booking.guestEmail, {
        guestName: cancelReq.booking.guestName,
        referenceId: cancelReq.booking.referenceId,
        reason: adminResponse,
      });
    }

    return NextResponse.json(updatedReq);
  } catch (error) {
    console.error("[Admin Cancellation Update API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
