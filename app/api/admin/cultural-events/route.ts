import { NextResponse } from "next/server";
import { db } from "@/db";
import { culturalEvents } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  const isAdmin = await verifySession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await db.query.culturalEvents.findMany({
      orderBy: [asc(culturalEvents.sortOrder), desc(culturalEvents.createdAt)],
      with: { media: true },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Cultural Events API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    const { name, slug, category, description, shortDescription, period, isActive, sortOrder } = data;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const [created] = await db
      .insert(culturalEvents)
      .values({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        category: category?.trim() || null,
        description: description?.trim() || null,
        shortDescription: shortDescription?.trim() || null,
        period: period?.trim() || null,
        isActive: isActive !== false,
        sortOrder: Number(sortOrder) || 0,
      })
      .returning();

    revalidateTag("homepage", "max");
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[Cultural Events API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
