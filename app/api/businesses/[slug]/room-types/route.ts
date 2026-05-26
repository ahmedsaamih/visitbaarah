import { NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, roomTypes } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { getMaldivianDiscountMap, getSeasonalRatesMap } from "@/lib/room-pricing";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const biz = await db.query.businesses.findFirst({ where: eq(businesses.slug, slug) });
    if (!biz || !biz.isActive) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const items = await db.query.roomTypes.findMany({
      where: and(eq(roomTypes.businessId, biz.id), eq(roomTypes.isActive, true)),
      orderBy: [asc(roomTypes.sortOrder)],
    });

    const rateMap = await getSeasonalRatesMap(items.map((rt) => rt.id));
    const discountMap = await getMaldivianDiscountMap(items.map((rt) => rt.id));

    return NextResponse.json(
      items.map((rt) => ({
        id: rt.id,
        name: rt.name,
        description: rt.description,
        basePrice: rt.basePrice,
        maxGuests: rt.maxGuests,
        bedType: rt.bedType,
        size: rt.size,
        amenities: rt.amenities,
        seasonalRates: rateMap.get(rt.id) || [],
        maldivianDiscountPercent: discountMap.get(rt.id) || "0.00",
      }))
    );
  } catch (error) {
    console.error("[Public Business Room Types API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
