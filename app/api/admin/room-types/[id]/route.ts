import { NextResponse } from "next/server";
import { db } from "@/db";
import { roomTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

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

  try {
    const [deletedItem] = await db
      .delete(roomTypes)
      .where(eq(roomTypes.id, itemId))
      .returning();

    if (!deletedItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // @ts-ignore: Next.js 16 type mismatch
    revalidateTag("homepage");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Room Types ID API] DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
