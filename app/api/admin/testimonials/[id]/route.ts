import { NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    const item = await db.query.testimonials.findFirst({
      where: eq(testimonials.id, itemId),
      with: {
        booking: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("[Testimonials ID API] GET Error:", error);
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
    
    // Sanitize data: Exclude fields that shouldn't be updated
    const { id: _, createdAt: __, ...updateData } = data;

    if (updateData.isFeatured === true) {
      await db
        .update(testimonials)
        .set({ isFeatured: false })
        .where(eq(testimonials.isFeatured, true));
    }

    const [updatedItem] = await db
      .update(testimonials)
      .set(updateData)
      .where(eq(testimonials.id, itemId))
      .returning();

    if (!updatedItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidateTag("homepage", "max");
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("[Testimonials ID API] PATCH Error:", error);
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
      .delete(testimonials)
      .where(eq(testimonials.id, itemId))
      .returning();

    if (!deletedItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidateTag("homepage", "max");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Testimonials ID API] DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
