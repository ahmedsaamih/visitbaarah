import { NextResponse } from "next/server";
import { db } from "@/db";
import { roomAvailability, rooms, bookings } from "@/db/schema";
import { eq, and, between, ne, lt, gte } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!roomId || !startDate || !endDate) {
    return NextResponse.json(
      { error: "roomId, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  try {
    const manualItems = await db.query.roomAvailability.findMany({
      where: and(
        eq(roomAvailability.roomId, parseInt(roomId)),
        between(roomAvailability.date, startDate, endDate)
      ),
    });

    // Also reflect occupancy from active bookings assigned to this room.
    // This keeps the admin calendar aligned when bookings are confirmed.
    const activeBookings = await db.query.bookings.findMany({
      where: and(
        eq(bookings.assignedRoomId, parseInt(roomId)),
        ne(bookings.status, "cancelled"),
        ne(bookings.status, "rejected"),
        ne(bookings.status, "checked_out"),
        lt(bookings.checkIn, incrementDateString(endDate)),
        gte(bookings.checkOut, incrementDateString(startDate))
      ),
    });

    const mergedByDate = new Map<string, any>();

    for (const item of manualItems) {
      mergedByDate.set(item.date, item);
    }

    for (const booking of activeBookings) {
      const occupiedDates = eachStayDate(booking.checkIn, booking.checkOut);
      for (const date of occupiedDates) {
        if (date < startDate || date > endDate) continue;
        const existing = mergedByDate.get(date);
        if (existing) {
          mergedByDate.set(date, {
            ...existing,
            isBlocked: true,
            reason: existing.reason || `Booking ${booking.referenceId}`,
          });
        } else {
          mergedByDate.set(date, {
            id: `booking-${booking.id}-${date}`,
            roomId: parseInt(roomId),
            date,
            isBlocked: true,
            reason: `Booking ${booking.referenceId}`,
            createdAt: booking.updatedAt,
          });
        }
      }
    }

    return NextResponse.json(Array.from(mergedByDate.values()));
  } catch (error) {
    console.error("[Availability Admin API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { roomId, dates, isBlocked, reason } = await request.json();
    const parsedRoomId = Number(roomId);
    const parsedReason = typeof reason === "string" ? reason.slice(0, 255) : null;

    if (!Number.isInteger(parsedRoomId) || !dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: "roomId and dates array are required" },
        { status: 400 }
      );
    }

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, parsedRoomId),
    });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const validDates = dates.filter(
      (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    );
    if (validDates.length === 0) {
      return NextResponse.json({ error: "No valid dates provided" }, { status: 400 });
    }

    const results = [];
    for (const date of validDates) {
      // Upsert availability record
      const existing = await db.query.roomAvailability.findFirst({
        where: and(
          eq(roomAvailability.roomId, parsedRoomId),
          eq(roomAvailability.date, date)
        ),
      });

      if (existing) {
        const [updated] = await db
          .update(roomAvailability)
          .set({ isBlocked: !!isBlocked, reason: parsedReason })
          .where(eq(roomAvailability.id, existing.id))
          .returning();
        results.push(updated);
      } else {
        const [inserted] = await db
          .insert(roomAvailability)
          .values({
            roomId: parsedRoomId,
            date,
            isBlocked: !!isBlocked,
            reason: parsedReason,
          })
          .returning();
        results.push(inserted);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Availability Admin API] POST Error:", error);
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 });
  }
}

function incrementDateString(dateStr: string) {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split("T")[0];
}

function eachStayDate(checkIn: string, checkOut: string) {
  const dates: string[] = [];
  const cursor = new Date(`${checkIn}T00:00:00.000Z`);
  const checkoutDate = new Date(`${checkOut}T00:00:00.000Z`);
  while (cursor < checkoutDate) {
    dates.push(cursor.toISOString().split("T")[0]);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}
