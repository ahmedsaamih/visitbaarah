import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");

  try {
    if (!entityType || !entityId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const items = await db.query.media.findMany({
      where: and(
        eq(media.entityType, entityType),
        eq(media.entityId, parseInt(entityId))
      ),
      orderBy: (media, { desc }) => [desc(media.createdAt)],
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}
