import { NextResponse } from "next/server";
import { db } from "@/db";
import { roomTypes, rooms, roomAvailability, bookings, media } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id);

  try {
    const item = await db.query.roomTypes.findFirst({
      where: eq(roomTypes.id, itemId),
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("[Room Types ID API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id);

  try {
    const data = await request.json();
    
    // Sanitize data: Exclude fields that shouldn't be updated and handle type conversion
    const { id: _, createdAt: __, updatedAt: ___, ...updateData } = data;
    
    if (updateData.basePrice !== undefined) updateData.basePrice = updateData.basePrice.toString();
    if (updateData.maxGuests !== undefined) updateData.maxGuests = parseInt(updateData.maxGuests);
    if (updateData.sortOrder !== undefined) updateData.sortOrder = parseInt(updateData.sortOrder);

    const [updatedItem] = await db
      .update(roomTypes)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(roomTypes.id, itemId))
      .returning();

    if (!updatedItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("[Room Types ID API] PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id);
  if (!Number.isInteger(itemId)) {
    return NextResponse.json({ error: "Invalid room type id" }, { status: 400 });
  }

  try {
    const deletedItem = await db.transaction(async (tx) => {
      const relatedRooms = await tx.query.rooms.findMany({
        where: eq(rooms.roomTypeId, itemId),
      });
      const relatedRoomIds = relatedRooms.map((room) => room.id);

      if (relatedRoomIds.length > 0) {
        await tx
          .update(bookings)
          .set({ assignedRoomId: null })
          .where(inArray(bookings.assignedRoomId, relatedRoomIds));

        await tx
          .delete(roomAvailability)
          .where(inArray(roomAvailability.roomId, relatedRoomIds));

        await tx.delete(rooms).where(eq(rooms.roomTypeId, itemId));
      }

      await tx
        .delete(media)
        .where(eq(media.roomTypeId, itemId));

      const [deleted] = await tx
        .delete(roomTypes)
        .where(eq(roomTypes.id, itemId))
        .returning();

      return deleted;
    });

    if (!deletedItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidateTag("homepage");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Room Types ID API] DELETE Error:", error);
    const message =
      error instanceof Error && error.message.toLowerCase().includes("violates foreign key")
        ? "This room type has existing bookings and cannot be deleted safely. Archive it instead."
        : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
