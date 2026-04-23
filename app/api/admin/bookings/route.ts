import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await db.query.bookings.findMany({
      orderBy: [desc(bookings.createdAt)],
      with: {
        roomType: true,
        assignedRoom: true,
        testimonials: true,
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Admin Bookings API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
