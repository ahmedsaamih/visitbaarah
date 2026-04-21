import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, roomTypes, bookingAddons } from "@/db/schema";
import { generateReferenceId } from "@/lib/reference";
import { sendBookingReceivedEmail, sendAdminNewBookingEmail } from "@/lib/plunk";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      guestName,
      guestEmail,
      guestPhone,
      guestCountry,
      roomTypeId,
      checkIn,
      checkOut,
      numGuests,
      numRooms,
      roomTotal,
      addonsTotal,
      totalAmount,
      specialRequests,
      addons // Array of { addonType, addonId, addonName, quantity, unitPrice, totalPrice, date }
    } = data;

    // 1. Validate required fields
    if (!guestName || !guestEmail || !roomTypeId || !checkIn || !checkOut || !totalAmount) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
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
          guestEmail,
          guestPhone,
          guestCountry,
          roomTypeId: parseInt(roomTypeId),
          checkIn,
          checkOut,
          numGuests: parseInt(numGuests) || 1,
          numRooms: parseInt(numRooms) || 1,
          roomTotal,
          addonsTotal: addonsTotal || "0",
          totalAmount,
          specialRequests,
          status: "pending",
        })
        .returning();

      // Addons if any
      if (addons && Array.isArray(addons) && addons.length > 0) {
        await tx.insert(bookingAddons).values(
          addons.map((addon: any) => ({
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

    // 4. Fetch Room Type Name for Email
    const roomType = await db.query.roomTypes.findFirst({
      where: eq(roomTypes.id, parseInt(roomTypeId)),
    });

    // 5. Send Emails (Fire and forget or await?)
    // Using await for reliability in this context
    try {
      await sendBookingReceivedEmail(guestEmail, {
        guestName,
        referenceId,
        roomType: roomType?.name || "Room",
        checkIn,
        checkOut,
        totalAmount: `$${totalAmount}`,
      });

      await sendAdminNewBookingEmail({
        guestName,
        guestEmail,
        referenceId,
        roomType: roomType?.name || "Room",
        checkIn,
        checkOut,
        totalAmount: `$${totalAmount}`,
      });
    } catch (emailError) {
      console.error("[Booking API] Email sending failed:", emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({ success: true, referenceId, bookingId: booking.id });
  } catch (error) {
    console.error("[Booking API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
