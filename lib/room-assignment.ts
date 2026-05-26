import { db } from "@/db";
import { bookings, rooms, roomAvailability } from "@/db/schema";
import { and, eq, gte, inArray, lt, ne } from "drizzle-orm";

export async function findAvailableRoomId(params: {
  excludeBookingId: number; // -1 for new bookings (no existing booking to exclude)
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
}): Promise<number | null> {
  const { excludeBookingId, roomTypeId, checkIn, checkOut } = params;

  const candidateRooms = await db.query.rooms.findMany({
    where: eq(rooms.roomTypeId, roomTypeId),
  });
  if (candidateRooms.length === 0) return null;

  const roomIds = candidateRooms.map((r) => r.id);
  const blockedRows = await db.query.roomAvailability.findMany({
    where: and(
      inArray(roomAvailability.roomId, roomIds),
      eq(roomAvailability.isBlocked, true),
      gte(roomAvailability.date, checkIn),
      lt(roomAvailability.date, checkOut)
    ),
  });
  const blockedRoomIds = new Set(blockedRows.map((row) => row.roomId));

  for (const room of candidateRooms) {
    if (blockedRoomIds.has(room.id)) continue;

    const overlapConditions = [
      eq(bookings.assignedRoomId, room.id),
      ne(bookings.status, "cancelled"),
      ne(bookings.status, "rejected"),
      ne(bookings.status, "checked_out"),
      lt(bookings.checkIn, checkOut),
      gte(bookings.checkOut, incrementDate(checkIn)),
    ];
    if (excludeBookingId > 0) {
      overlapConditions.push(ne(bookings.id, excludeBookingId));
    }

    const overlap = await db.query.bookings.findFirst({
      where: and(...overlapConditions),
    });
    if (!overlap) return room.id;
  }

  return null;
}

function incrementDate(dateStr: string): string {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split("T")[0];
}
