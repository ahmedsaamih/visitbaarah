import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, rooms, roomAvailability, roomTypes } from "@/db/schema";
import { desc, eq, and, ne, gte, lt, inArray } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { generateReferenceId } from "@/lib/reference";
import { sendBookingConfirmedEmail } from "@/lib/plunk";

export async function GET() {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await db.query.bookings.findMany({
      orderBy: [desc(bookings.createdAt)],
      with: {
        roomType: true,
        assignedRoom: true,
        testimonials: true,
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Admin Bookings API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const guestName = typeof data.guestName === "string" ? data.guestName.trim() : "";
    const guestEmailRaw = typeof data.guestEmail === "string" ? data.guestEmail.trim().toLowerCase() : "";
    const guestPhone = typeof data.guestPhone === "string" ? data.guestPhone.trim() : "";
    const guestCountry = typeof data.guestCountry === "string" ? data.guestCountry.trim() : "";
    const checkIn = typeof data.checkIn === "string" ? data.checkIn : "";
    const checkOut = typeof data.checkOut === "string" ? data.checkOut : "";
    const specialRequests = typeof data.specialRequests === "string" ? data.specialRequests.trim() : "";
    const totalAmountRaw = data.totalAmount;
    const sendCustomerEmail = data.sendCustomerEmail === true;
    const roomTypeId = Number(data.roomTypeId);
    const numGuests = Number(data.numGuests) || 1;
    const numRooms = Number(data.numRooms) || 1;
    let assignedRoomId = data.assignedRoomId ? Number(data.assignedRoomId) : null;

    if (!guestName || !guestEmailRaw || !checkIn || !checkOut || !Number.isInteger(roomTypeId)) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (checkIn >= checkOut) {
      return NextResponse.json({ error: "Check-out must be after check-in." }, { status: 400 });
    }

    const totalAmountNumber = Number(totalAmountRaw);
    if (!Number.isFinite(totalAmountNumber) || totalAmountNumber <= 0) {
      return NextResponse.json({ error: "Valid total amount is required." }, { status: 400 });
    }
    const totalAmount = totalAmountNumber.toFixed(2);

    if (assignedRoomId) {
      const room = await db.query.rooms.findFirst({
        where: and(eq(rooms.id, assignedRoomId), eq(rooms.roomTypeId, roomTypeId)),
      });
      if (!room) {
        return NextResponse.json({ error: "Assigned room does not match selected room type." }, { status: 400 });
      }
    } else {
      assignedRoomId = await findAvailableRoomId({
        id: -1,
        roomTypeId,
        checkIn,
        checkOut,
      });
      if (!assignedRoomId) {
        return NextResponse.json(
          { error: "No available room for selected dates. Choose a different date range." },
          { status: 400 }
        );
      }
    }

    const referenceId = await generateReferenceId();
    const [created] = await db
      .insert(bookings)
      .values({
        referenceId,
        guestName,
        guestEmail: guestEmailRaw,
        guestPhone: guestPhone || null,
        guestCountry: guestCountry || null,
        roomTypeId,
        assignedRoomId,
        checkIn,
        checkOut,
        numGuests,
        numRooms,
        roomTotal: totalAmount,
        addonsTotal: "0",
        totalAmount,
        specialRequests: specialRequests || null,
        status: "confirmed",
        adminNotes: "Manual booking created by admin",
      })
      .returning();

    if (sendCustomerEmail) {
      try {
        const [roomType, assignedRoom] = await Promise.all([
          db.query.roomTypes.findFirst({ where: eq(roomTypes.id, roomTypeId) }),
          db.query.rooms.findFirst({ where: eq(rooms.id, assignedRoomId) }),
        ]);

        const sent = await sendBookingConfirmedEmail(guestEmailRaw, {
          guestName,
          referenceId,
          roomType: roomType?.name ?? "Room",
          roomNumber: assignedRoom?.roomNumber,
          checkIn,
          checkOut,
        });

        if (!sent) {
          console.error("[Admin Bookings API] Manual booking confirmation email failed.", {
            referenceId,
            guestEmail: guestEmailRaw,
          });
        }
      } catch (emailError) {
        console.error("[Admin Bookings API] Manual booking confirmation email error:", emailError);
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[Admin Bookings API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function findAvailableRoomId(booking: {
  id: number;
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
}) {
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
