import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, roomAvailability, bookings } from "@/db/schema";
import { eq, and, gte, lt, ne, inArray, isNull } from "drizzle-orm";

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

    // 1) Get all rooms of this type
    const allRooms = await db.query.rooms.findMany({
      where: eq(rooms.roomTypeId, parsedRoomTypeId),
    });

    if (allRooms.length === 0) {
      return NextResponse.json({ available: false, message: "No rooms of this type exist" });
    }

    const roomIds = allRooms.map((room) => room.id);

    // 2) Rooms blocked in the requested range.
    const blockedRows = await db.query.roomAvailability.findMany({
      where: and(
        inArray(roomAvailability.roomId, roomIds),
        eq(roomAvailability.isBlocked, true),
        gte(roomAvailability.date, checkIn),
        lt(roomAvailability.date, checkOut)
      ),
    });
    const blockedRoomIds = new Set(blockedRows.map((row) => row.roomId));

    const openRoomIds = roomIds.filter((roomId) => !blockedRoomIds.has(roomId));
    if (openRoomIds.length === 0) {
      return NextResponse.json({
        available: false,
        availableCount: 0,
        roomTypeId: parsedRoomTypeId,
        checkIn,
        checkOut,
      });
    }

    // 3) Occupancy from already-assigned active bookings.
    const overlappingAssignedBookings = await db.query.bookings.findMany({
      where: and(
        inArray(bookings.assignedRoomId, openRoomIds),
        ne(bookings.status, "cancelled"),
        ne(bookings.status, "rejected"),
        ne(bookings.status, "checked_out"),
        lt(bookings.checkIn, checkOut),
        gte(bookings.checkOut, incrementDateString(checkIn))
      ),
    });
    const occupiedAssignedRoomIds = new Set(
      overlappingAssignedBookings
        .map((booking) => booking.assignedRoomId)
        .filter((roomId): roomId is number => typeof roomId === "number")
    );

    // 4) Unassigned active bookings still consume capacity for this room type.
    const unassignedBookings = await db.query.bookings.findMany({
      where: and(
        eq(bookings.roomTypeId, parsedRoomTypeId),
        isNull(bookings.assignedRoomId),
        ne(bookings.status, "cancelled"),
        ne(bookings.status, "rejected"),
        ne(bookings.status, "checked_out"),
        lt(bookings.checkIn, checkOut),
        gte(bookings.checkOut, incrementDateString(checkIn))
      ),
    });

    const availableCount = Math.max(
      0,
      openRoomIds.length - occupiedAssignedRoomIds.size - unassignedBookings.length
    );

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
