import { NextResponse } from "next/server";
import { db } from "@/db";
import { roomTypes } from "@/db/schema";
import { desc, asc } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import {
  getMaldivianDiscountMap,
  getSeasonalRatesMap,
  normalizeSeasonalRates,
  saveMaldivianDiscountPercent,
  saveSeasonalRates,
} from "@/lib/room-pricing";

export async function GET() {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const roomTypeItems = await db.query.roomTypes.findMany({
      orderBy: [asc(roomTypes.sortOrder), desc(roomTypes.createdAt)],
    });
    const ratesByRoomType = await getSeasonalRatesMap(roomTypeItems.map((roomType) => roomType.id));
    const discountByRoomType = await getMaldivianDiscountMap(roomTypeItems.map((roomType) => roomType.id));
    const items = roomTypeItems.map((roomType) => ({
      ...roomType,
      seasonalRates: ratesByRoomType.get(roomType.id) || [],
      maldivianDiscountPercent: discountByRoomType.get(roomType.id) || "0.00",
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
    const [newItem] = await db.insert(roomTypes).values(roomTypePayload).returning();
    await saveSeasonalRates(newItem.id, normalizeSeasonalRates(seasonalRates));
    await saveMaldivianDiscountPercent(newItem.id, maldivianDiscountPercent);
    return NextResponse.json(newItem);
  } catch (error) {
    console.error("[Room Types API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
