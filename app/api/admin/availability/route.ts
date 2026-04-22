import { NextResponse } from "next/server";
import { db } from "@/db";
import { roomAvailability } from "@/db/schema";
import { eq, and, between } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!roomId || !startDate || !endDate) {
    return NextResponse.json(
      { error: "roomId, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  try {
    const items = await db.query.roomAvailability.findMany({
      where: and(
        eq(roomAvailability.roomId, parseInt(roomId)),
        between(roomAvailability.date, startDate, endDate)
      ),
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Availability Admin API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { roomId, dates, isBlocked, reason } = await request.json();
    const parsedRoomId = Number(roomId);

    if (!Number.isInteger(parsedRoomId) || !dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: "roomId and dates array are required" },
        { status: 400 }
      );
    }

    const results = [];
    for (const date of dates) {
      // Upsert availability record
      const existing = await db.query.roomAvailability.findFirst({
        where: and(
          eq(roomAvailability.roomId, parsedRoomId),
          eq(roomAvailability.date, date)
        ),
      });

      if (existing) {
        const [updated] = await db
          .update(roomAvailability)
          .set({ isBlocked, reason }) 
          .where(eq(roomAvailability.id, existing.id))
          .returning();
        results.push(updated);
      } else {
        const [inserted] = await db
          .insert(roomAvailability)
          .values({
            roomId: parsedRoomId,
            date,
            isBlocked,
            reason,
          })
          .returning();
        results.push(inserted);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Availability Admin API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
