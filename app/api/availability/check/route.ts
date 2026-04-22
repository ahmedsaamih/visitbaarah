import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, roomAvailability, bookings } from "@/db/schema";
import { eq, and, gte, lt, ne } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomTypeId = searchParams.get("roomTypeId");
  const checkIn = searchParams.get("checkIn") || searchParams.get("startDate"); // YYYY-MM-DD
  const checkOut = searchParams.get("checkOut") || searchParams.get("endDate"); // YYYY-MM-DD

  if (!roomTypeId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "roomTypeId, checkIn, and checkOut are required" },
      { status: 400 }
    );
  }

  try {
    const parsedRoomTypeId = Number(roomTypeId);
    if (!Number.isInteger(parsedRoomTypeId)) {
      return NextResponse.json({ error: "Invalid roomTypeId" }, { status: 400 });
    }

    if (checkIn >= checkOut) {
      return NextResponse.json({ error: "checkOut must be after checkIn" }, { status: 400 });
    }

    // 1. Get all rooms of this type
    const allRooms = await db.query.rooms.findMany({
      where: eq(rooms.roomTypeId, parsedRoomTypeId),
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
          lt(roomAvailability.date, checkOut) // Include check-in, exclude check-out
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
            lt(bookings.checkIn, checkOut),
            gte(bookings.checkOut, incrementDateString(checkIn))
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
      roomTypeId: parsedRoomTypeId,
      checkIn,
      checkOut
    });
  } catch (error) {
    console.error("[Availability Check API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function incrementDateString(dateStr: string) {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split("T")[0];
}
