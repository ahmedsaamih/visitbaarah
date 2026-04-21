import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { desc, asc } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await db.query.media.findMany({
      orderBy: [asc(media.sortOrder), desc(media.createdAt)],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Gallery API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
