import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await db.query.settings.findMany();
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Settings API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json(); // Expected: { key: string, value: string, group?: string }
    
    // Check if exists
    const existing = await db.query.settings.findFirst({
      where: eq(settings.key, data.key),
    });

    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(settings.key, data.key))
        .returning();
      return NextResponse.json(updated);
    } else {
      const [newSetting] = await db.insert(settings).values(data).returning();
      return NextResponse.json(newSetting);
    }
  } catch (error) {
    console.error("[Settings API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
