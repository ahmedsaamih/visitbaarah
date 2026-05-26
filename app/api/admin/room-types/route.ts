import { NextResponse } from "next/server";
import { db } from "@/db";
import { roomTypes } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import {
  getMaldivianDiscountMap,
  getSeasonalRatesMap,
  normalizeSeasonalRates,
  saveMaldivianDiscountPercent,
  saveSeasonalRates,
} from "@/lib/room-pricing";

export async function GET(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const businessIdParam = searchParams.get("businessId");
    const businessId = businessIdParam ? Number(businessIdParam) : null;

    const roomTypeItems = await db.query.roomTypes.findMany({
      where: businessId ? eq(roomTypes.businessId, businessId) : undefined,
      orderBy: [asc(roomTypes.sortOrder), desc(roomTypes.createdAt)],
    });
    const ratesByRoomType = await getSeasonalRatesMap(roomTypeItems.map((rt) => rt.id));
    const discountByRoomType = await getMaldivianDiscountMap(roomTypeItems.map((rt) => rt.id));
    const items = roomTypeItems.map((rt) => ({
      ...rt,
      seasonalRates: ratesByRoomType.get(rt.id) || [],
      maldivianDiscountPercent: discountByRoomType.get(rt.id) || "0.00",
    }));
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Room Types API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { seasonalRates, maldivianDiscountPercent, ...roomTypePayload } = data;
    if (roomTypePayload.businessId !== undefined) {
      roomTypePayload.businessId = roomTypePayload.businessId ? Number(roomTypePayload.businessId) : null;
    }
    const [newItem] = await db.insert(roomTypes).values(roomTypePayload).returning();
    await saveSeasonalRates(newItem.id, normalizeSeasonalRates(seasonalRates));
    await saveMaldivianDiscountPercent(newItem.id, maldivianDiscountPercent);
    return NextResponse.json(newItem);
  } catch (error) {
    console.error("[Room Types API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
