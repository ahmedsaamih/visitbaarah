import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
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
    const item = await db.query.services.findFirst({
      where: eq(services.id, itemId),
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("[Services ID API] GET Error:", error);
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
      .update(services)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(services.id, itemId))
      .returning();

    if (!updatedItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("[Services ID API] PATCH Error:", error);
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
      .delete(services)
      .where(eq(services.id, itemId))
      .returning();

    if (!deletedItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Services ID API] DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
