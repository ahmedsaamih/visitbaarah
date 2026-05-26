import { NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, roomTypes } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import {
  getMaldivianDiscountMap,
  getSeasonalRatesMap,
  normalizeSeasonalRates,
  saveMaldivianDiscountPercent,
  saveSeasonalRates,
} from "@/lib/room-pricing";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const isAdmin = await verifySession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const bizId = Number(id);

  try {
    const biz = await db.query.businesses.findFirst({ where: eq(businesses.id, bizId) });
    if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const items = await db.query.roomTypes.findMany({
      where: eq(roomTypes.businessId, bizId),
      orderBy: [asc(roomTypes.sortOrder), desc(roomTypes.createdAt)],
    });
    const rateMap = await getSeasonalRatesMap(items.map((rt) => rt.id));
    const discountMap = await getMaldivianDiscountMap(items.map((rt) => rt.id));
    return NextResponse.json(
      items.map((rt) => ({
        ...rt,
        seasonalRates: rateMap.get(rt.id) || [],
        maldivianDiscountPercent: discountMap.get(rt.id) || "0.00",
      }))
    );
  } catch (error) {
    console.error("[Business Room Types API] GET Error:", error);
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
    const { seasonalRates, maldivianDiscountPercent, ...payload } = data;

    // Auto-namespace slug under the business slug to avoid global collisions
    if (!payload.slug && payload.name) {
      const nameSlug = String(payload.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      payload.slug = `${biz.slug}-${nameSlug}`;
    }

    const [newItem] = await db
      .insert(roomTypes)
      .values({ ...payload, businessId: bizId })
      .returning();
    await saveSeasonalRates(newItem.id, normalizeSeasonalRates(seasonalRates));
    await saveMaldivianDiscountPercent(newItem.id, maldivianDiscountPercent);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("[Business Room Types API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
