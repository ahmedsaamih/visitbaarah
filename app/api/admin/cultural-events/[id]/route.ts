import { NextResponse } from "next/server";
import { db } from "@/db";
import { culturalEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifySession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const eventId = parseInt(id);

  try {
    const data = await request.json();
    const { id: _id, createdAt: _c, updatedAt: _u, media: _m, ...fields } = data;

    const [updated] = await db
      .update(culturalEvents)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(culturalEvents.id, eventId))
      .returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    revalidateTag("homepage", "max");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Cultural Events API] PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifySession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const eventId = parseInt(id);

  try {
    await db.delete(culturalEvents).where(eq(culturalEvents.id, eventId));
    revalidateTag("homepage", "max");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Cultural Events API] DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
