import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, roomAvailability, bookings, roomTypes, businesses } from "@/db/schema";
import { eq, and, gte, lt, ne, inArray, isNull, asc } from "drizzle-orm";
import {
  calculateRoomPricing,
  getMaldivianDiscountMap,
  getSeasonalRatesMap,
  isMaldivianNationality,
} from "@/lib/room-pricing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomTypeId = searchParams.get("roomTypeId");
  const businessIdParam = searchParams.get("businessId");
  const checkIn = searchParams.get("checkIn") || searchParams.get("startDate");
  const checkOut = searchParams.get("checkOut") || searchParams.get("endDate");
  const nationality = searchParams.get("nationality") || "";

  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: "checkIn and checkOut are required" }, { status: 400 });
  }
  if (!roomTypeId && !businessIdParam) {
    return NextResponse.json({ error: "roomTypeId or businessId is required" }, { status: 400 });
  }

  // businessId path: find the best available room type for this business
  if (!roomTypeId && businessIdParam) {
    const parsedBizId = Number(businessIdParam);
    if (!Number.isInteger(parsedBizId)) return NextResponse.json({ error: "Invalid businessId" }, { status: 400 });
    if (checkIn >= checkOut) return NextResponse.json({ error: "checkOut must be after checkIn" }, { status: 400 });

    try {
      const biz = await db.query.businesses.findFirst({ where: eq(businesses.id, parsedBizId) });
      if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

      const bizRoomTypes = await db.query.roomTypes.findMany({
        where: and(eq(roomTypes.businessId, parsedBizId), eq(roomTypes.isActive, true)),
        orderBy: [asc(roomTypes.sortOrder)],
      });

      if (bizRoomTypes.length === 0) {
        return NextResponse.json({ available: false, message: "No room types configured for this property" });
      }

      for (const rt of bizRoomTypes) {
        const allRooms = await db.query.rooms.findMany({ where: eq(rooms.roomTypeId, rt.id) });
        if (allRooms.length === 0) continue;
        const roomIds = allRooms.map((r) => r.id);

        const blockedRows = await db.query.roomAvailability.findMany({
          where: and(inArray(roomAvailability.roomId, roomIds), eq(roomAvailability.isBlocked, true), gte(roomAvailability.date, checkIn), lt(roomAvailability.date, checkOut)),
        });
        const blockedRoomIds = new Set(blockedRows.map((r) => r.roomId));
        const openRoomIds = roomIds.filter((rid) => !blockedRoomIds.has(rid));
        if (openRoomIds.length === 0) continue;

        const overlapping = await db.query.bookings.findMany({
          where: and(inArray(bookings.assignedRoomId, openRoomIds), ne(bookings.status, "cancelled"), ne(bookings.status, "rejected"), ne(bookings.status, "checked_out"), lt(bookings.checkIn, checkOut), gte(bookings.checkOut, incrementDateString(checkIn))),
        });
        const occupiedIds = new Set(overlapping.map((b) => b.assignedRoomId).filter((rid): rid is number => typeof rid === "number"));
        const availableCount = openRoomIds.filter((rid) => !occupiedIds.has(rid)).length;
        if (availableCount === 0) continue;

        const rateMap = await getSeasonalRatesMap([rt.id]);
        const discountMap = await getMaldivianDiscountMap([rt.id]);
        const pricing = calculateRoomPricing(rt.basePrice, checkIn, checkOut, rateMap.get(rt.id) || [], {
          applyMaldivianDiscount: isMaldivianNationality(nationality),
          maldivianDiscountPercent: discountMap.get(rt.id) || "0.00",
        });
        return NextResponse.json({ available: true, availableCount, roomTypeId: rt.id, roomTypeName: rt.name, checkIn, checkOut, pricing });
      }

      return NextResponse.json({ available: false, availableCount: 0, checkIn, checkOut });
    } catch (error) {
      console.error("[Availability Check API] Business path error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  try {
    const parsedRoomTypeId = Number(roomTypeId);
    if (!Number.isInteger(parsedRoomTypeId)) {
      return NextResponse.json({ error: "Invalid roomTypeId" }, { status: 400 });
    }

    if (checkIn >= checkOut) {
      return NextResponse.json({ error: "checkOut must be after checkIn" }, { status: 400 });
    }

    const roomType = await db.query.roomTypes.findFirst({
      where: eq(roomTypes.id, parsedRoomTypeId),
    });
    if (!roomType) {
      return NextResponse.json({ error: "Room type not found" }, { status: 404 });
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
    const rateMap = await getSeasonalRatesMap([parsedRoomTypeId]);
    const discountMap = await getMaldivianDiscountMap([parsedRoomTypeId]);
    const pricing = calculateRoomPricing(
      roomType.basePrice,
      checkIn,
      checkOut,
      rateMap.get(parsedRoomTypeId) || [],
      {
        applyMaldivianDiscount: isMaldivianNationality(nationality),
        maldivianDiscountPercent: discountMap.get(parsedRoomTypeId) || "0.00",
      }
    );

    return NextResponse.json({
      available: availableCount > 0,
      availableCount,
      roomTypeId: parsedRoomTypeId,
      checkIn,
      checkOut,
      pricing,
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
