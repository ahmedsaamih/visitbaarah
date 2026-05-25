import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, roomTypes, bookingAddons, businesses } from "@/db/schema";
import { generateReferenceId } from "@/lib/reference";
import { sendBookingReceivedEmail, sendAdminNewBookingEmail } from "@/lib/plunk";
import { checkTransactionalRequestLimit, getTransactionalRetryMessage } from "@/lib/transactional-rate-limit";
import { sendTelegramNotification } from "@/lib/telegram";
import { eq } from "drizzle-orm";
import {
  calculateRoomPricing,
  getMaldivianDiscountMap,
  getSeasonalRatesMap,
  isMaldivianNationality,
} from "@/lib/room-pricing";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      guestName,
      guestEmail,
      guestPhone,
      guestCountry,
      nationality,
      roomTypeId,
      businessId,
      checkIn,
      checkOut,
      numGuests,
      numRooms,
      addonsTotal,
      specialRequests,
      addons // Array of { addonType, addonId, addonName, quantity, unitPrice, totalPrice, date }
    } = data;

    // 1. Validate required fields
    if (!guestName || !guestEmail || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }
    if (!roomTypeId && !businessId) {
      return NextResponse.json({ error: "A room type or business is required" }, { status: 400 });
    }
    const normalizedGuestEmail = String(guestEmail).trim().toLowerCase();

    const limit = checkTransactionalRequestLimit("booking_request", normalizedGuestEmail);
    if (!limit.allowed) {
      return NextResponse.json({ error: getTransactionalRetryMessage() }, { status: 429 });
    }

    // Pricing: calculate if room type provided, otherwise booking is a request (price TBD by admin)
    let roomTotal = "0.00";
    let totalAmount = "0.00";
    let roomType: Awaited<ReturnType<typeof db.query.roomTypes.findFirst>> | null = null;
    const parsedRoomTypeId = roomTypeId ? Number(roomTypeId) : null;
    const parsedBusinessId = businessId ? Number(businessId) : null;

    if (parsedRoomTypeId) {
      roomType = await db.query.roomTypes.findFirst({ where: eq(roomTypes.id, parsedRoomTypeId) }) ?? null;
      if (!roomType) {
        return NextResponse.json({ error: "Room type not found" }, { status: 404 });
      }
      const rateMap = await getSeasonalRatesMap([parsedRoomTypeId]);
      const discountMap = await getMaldivianDiscountMap([parsedRoomTypeId]);
      const effectiveNationality = typeof nationality === "string" ? nationality : guestCountry;
      const pricing = calculateRoomPricing(roomType.basePrice, checkIn, checkOut, rateMap.get(parsedRoomTypeId) || [], {
        applyMaldivianDiscount: isMaldivianNationality(effectiveNationality),
        maldivianDiscountPercent: discountMap.get(parsedRoomTypeId) || "0.00",
      });
      roomTotal = pricing.roomTotal;
      const addonsTotalValue = Number(addonsTotal || "0");
      totalAmount = (Number(roomTotal) + (Number.isFinite(addonsTotalValue) ? addonsTotalValue : 0)).toFixed(2);
    }

    // 2. Generate Reference ID
    const referenceId = await generateReferenceId();

    // 3. Create Booking in Transaction
    const booking = await db.transaction(async (tx) => {
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          referenceId,
          guestName,
          guestEmail: normalizedGuestEmail,
          guestPhone,
          guestCountry: typeof guestCountry === "string" && guestCountry.trim() ? guestCountry : (typeof nationality === "string" ? nationality : guestCountry),
          roomTypeId: parsedRoomTypeId,
          businessId: parsedBusinessId,
          checkIn,
          checkOut,
          numGuests: parseInt(numGuests) || 1,
          numRooms: parseInt(numRooms) || 1,
          roomTotal,
          addonsTotal: "0.00",
          totalAmount,
          specialRequests,
          status: "pending",
        })
        .returning();

      // Addons if any
      if (addons && Array.isArray(addons) && addons.length > 0) {
        type BookingAddonInput = {
          addonType: string;
          addonId: number;
          addonName: string;
          quantity: number;
          unitPrice: string;
          totalPrice: string;
          date?: string;
        };
        await tx.insert(bookingAddons).values(
          (addons as BookingAddonInput[]).map((addon) => ({
            bookingId: newBooking.id,
            addonType: addon.addonType,
            addonId: addon.addonId,
            addonName: addon.addonName,
            quantity: addon.quantity,
            unitPrice: addon.unitPrice,
            totalPrice: addon.totalPrice,
            date: addon.date,
          }))
        );
      }

      return newBooking;
    });

    // Resolve display name for emails (business name takes precedence if no room type)
    let bookingDisplayName = roomType?.name || "Booking";
    if (!roomType && parsedBusinessId) {
      const biz = await db.query.businesses.findFirst({ where: eq(businesses.id, parsedBusinessId) });
      if (biz) bookingDisplayName = biz.name;
    }

    try {
      const guestEmailSent = await sendBookingReceivedEmail(normalizedGuestEmail, {
        guestName,
        referenceId,
        roomType: bookingDisplayName,
        checkIn,
        checkOut,
        totalAmount: totalAmount !== "0.00" ? `$${totalAmount}` : "TBD",
      });

      const adminEmailSent = await sendAdminNewBookingEmail({
        guestName,
        guestEmail: normalizedGuestEmail,
        referenceId,
        roomType: bookingDisplayName,
        checkIn,
        checkOut,
        totalAmount: totalAmount !== "0.00" ? `$${totalAmount}` : "TBD",
      });

      if (!guestEmailSent || !adminEmailSent) {
        console.error("[Booking API] One or more transactional emails failed to send.", {
          referenceId,
          guestEmailSent,
          adminEmailSent,
        });
      }
    } catch (emailError) {
      console.error("[Booking API] Email sending failed:", emailError);
      // Don't fail the booking if email fails
    }

    await sendTelegramNotification("booking_request_received", {
      referenceId,
      guestName,
      guestEmail: normalizedGuestEmail,
      roomType: bookingDisplayName,
      checkIn,
      checkOut,
    });

    return NextResponse.json({ success: true, referenceId, bookingId: booking.id });
  } catch (error) {
    console.error("[Booking API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
