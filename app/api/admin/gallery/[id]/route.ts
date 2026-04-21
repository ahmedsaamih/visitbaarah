import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { deleteFromBlob } from "@/lib/blob";

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
    const item = await db.query.media.findFirst({
      where: eq(media.id, itemId),
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("[Gallery ID API] GET Error:", error);
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
    const [updatedItem] = await db
      .update(media)
      .set(data)
      .where(eq(media.id, itemId))
      .returning();

    if (!updatedItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("[Gallery ID API] PATCH Error:", error);
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
    // 1. Get the media record to find the URL
    const item = await db.query.media.findFirst({
      where: eq(media.id, itemId),
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 2. Delete from Vercel Blob
    await deleteFromBlob(item.url);
    if (item.thumbnailUrl) {
      await deleteFromBlob(item.thumbnailUrl);
    }

    // 3. Delete from DB
    await db.delete(media).where(eq(media.id, itemId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Gallery ID API] DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
