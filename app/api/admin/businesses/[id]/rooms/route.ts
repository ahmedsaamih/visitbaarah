import { NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, rooms, roomTypes } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const isAdmin = await verifySession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const bizId = Number(id);

  try {
    const biz = await db.query.businesses.findFirst({ where: eq(businesses.id, bizId) });
    if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const items = await db.query.rooms.findMany({
      where: eq(rooms.businessId, bizId),
      orderBy: [asc(rooms.roomNumber)],
      with: { roomType: true },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Business Rooms API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  const isAdmin = await verifySession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const bizId = Number(id);

  try {
    const biz = await db.query.businesses.findFirst({ where: eq(businesses.id, bizId) });
    if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const data = await request.json();
    const roomTypeId = Number(data.roomTypeId);

    // Validate: room type must belong to this business
    const roomType = await db.query.roomTypes.findFirst({ where: eq(roomTypes.id, roomTypeId) });
    if (!roomType) return NextResponse.json({ error: "Room type not found" }, { status: 404 });
    if (roomType.businessId !== bizId) {
      return NextResponse.json({ error: "Room type does not belong to this business" }, { status: 400 });
    }

    const [newRoom] = await db
      .insert(rooms)
      .values({ ...data, roomTypeId, businessId: bizId })
      .returning();
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error("[Business Rooms API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
