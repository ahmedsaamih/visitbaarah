import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, rooms, roomTypes, businesses } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { generateReferenceId } from "@/lib/reference";
import { sendBookingConfirmedEmail } from "@/lib/plunk";
import { sendTelegramNotification } from "@/lib/telegram";
import { findAvailableRoomId } from "@/lib/room-assignment";

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
        business: true,
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
    const roomTypeId = data.roomTypeId ? Number(data.roomTypeId) : null;
    const businessId = data.businessId ? Number(data.businessId) : null;
    const numGuests = Number(data.numGuests) || 1;
    const numRooms = Number(data.numRooms) || 1;
    let assignedRoomId = data.assignedRoomId ? Number(data.assignedRoomId) : null;

    if (!guestName || !guestEmailRaw || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (!roomTypeId && !businessId) {
      return NextResponse.json({ error: "Either a room type or business is required." }, { status: 400 });
    }
    if (checkIn >= checkOut) {
      return NextResponse.json({ error: "Check-out must be after check-in." }, { status: 400 });
    }

    const totalAmountNumber = Number(totalAmountRaw);
    const totalAmount = Number.isFinite(totalAmountNumber) && totalAmountNumber >= 0
      ? totalAmountNumber.toFixed(2)
      : "0.00";

    // Room assignment only applies when a room type is configured
    if (roomTypeId) {
      if (assignedRoomId) {
        const room = await db.query.rooms.findFirst({
          where: and(eq(rooms.id, assignedRoomId), eq(rooms.roomTypeId, roomTypeId)),
        });
        if (!room) {
          return NextResponse.json({ error: "Assigned room does not match selected room type." }, { status: 400 });
        }
      } else {
        assignedRoomId = await findAvailableRoomId({ excludeBookingId: -1, roomTypeId, checkIn, checkOut });
        if (!assignedRoomId) {
          return NextResponse.json(
            { error: "No available room for selected dates. Choose a different date range." },
            { status: 400 }
          );
        }
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
        businessId,
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
        const [roomType, assignedRoom, biz] = await Promise.all([
          roomTypeId ? db.query.roomTypes.findFirst({ where: eq(roomTypes.id, roomTypeId) }) : Promise.resolve(null),
          assignedRoomId ? db.query.rooms.findFirst({ where: eq(rooms.id, assignedRoomId) }) : Promise.resolve(null),
          businessId ? db.query.businesses.findFirst({ where: eq(businesses.id, businessId) }) : Promise.resolve(null),
        ]);

        const sent = await sendBookingConfirmedEmail(guestEmailRaw, {
          guestName,
          referenceId,
          roomType: roomType?.name ?? biz?.name ?? "Booking",
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

    try {
      const [telegramRoomType, telegramBiz] = await Promise.all([
        roomTypeId ? db.query.roomTypes.findFirst({ where: eq(roomTypes.id, roomTypeId) }) : Promise.resolve(null),
        businessId ? db.query.businesses.findFirst({ where: eq(businesses.id, businessId) }) : Promise.resolve(null),
      ]);
      await sendTelegramNotification("booking_confirmed", {
        referenceId,
        guestName,
        guestEmail: guestEmailRaw,
        roomType: telegramRoomType?.name ?? telegramBiz?.name ?? "Booking",
        checkIn,
        checkOut,
      });
    } catch (telegramError) {
      console.error("[Admin Bookings API] Manual booking telegram notify error:", telegramError);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[Admin Bookings API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

