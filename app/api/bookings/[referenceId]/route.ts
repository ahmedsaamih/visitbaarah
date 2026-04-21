import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ referenceId: string }> }
) {
  try {
    const { referenceId } = await params;

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

    // Hide internal fields for public lookup if necessary
    // (In this case, referenceId is the lookup key so it's pseudo-authenticated)
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error("[Booking Lookup API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
