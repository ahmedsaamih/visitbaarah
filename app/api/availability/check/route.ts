import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, roomAvailability, bookings, roomTypes } from "@/db/schema";
import { eq, and, gte, lte, ne, or } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomTypeId = searchParams.get("roomTypeId");
  const checkIn = searchParams.get("checkIn"); // YYYY-MM-DD
  const checkOut = searchParams.get("checkOut"); // YYYY-MM-DD

  if (!roomTypeId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "roomTypeId, checkIn, and checkOut are required" },
      { status: 400 }
    );
  }

  try {
    // 1. Get all rooms of this type
    const allRooms = await db.query.rooms.findMany({
      where: eq(rooms.roomTypeId, parseInt(roomTypeId)),
    });

    if (allRooms.length === 0) {
      return NextResponse.json({ available: false, message: "No rooms of this type exist" });
    }

    // 2. For each room, check if it's available for the entire range
    // A room is available if it has NO blocks and NO bookings in the range
    
    let availableCount = 0;
    const availableRooms = [];

    for (const room of allRooms) {
      // Check for blocks
      const blocks = await db.query.roomAvailability.findMany({
        where: and(
          eq(roomAvailability.roomId, room.id),
          eq(roomAvailability.isBlocked, true),
          gte(roomAvailability.date, checkIn),
          ltDate(roomAvailability.date, checkOut) // Only check block until day before checkout
        ),
      });

      if (blocks.length > 0) continue;

      // Check for overlapping bookings
      // Booking overlaps if: (start1 < end2) AND (end1 > start2)
      const overlappingBookings = await db.query.bookings.findMany({
        where: and(
          eq(bookings.assignedRoomId, room.id),
          ne(bookings.status, "cancelled"),
          ne(bookings.status, "rejected"),
          and(
            ltDate(bookings.checkIn, checkOut),
            gtDate(bookings.checkOut, checkIn)
          )
        ),
      });

      if (overlappingBookings.length === 0) {
        availableCount++;
        availableRooms.push(room);
      }
    }

    return NextResponse.json({
      available: availableCount > 0,
      availableCount,
      roomTypeId: parseInt(roomTypeId),
      checkIn,
      checkOut
    });
  } catch (error) {
    console.error("[Availability Check API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper for date comparisons in drizzle
function ltDate(column: any, value: string) {
  return lte(column, decrementDate(value));
}

function gtDate(column: any, value: string) {
  return gte(column, incrementDate(value));
}

function incrementDate(dateStr: string) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}

function decrementDate(dateStr: string) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}
