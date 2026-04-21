import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const items = await db.query.bookings.findMany({
      where: eq(bookings.guestEmail, email),
      orderBy: [desc(bookings.checkIn)],
      with: {
        roomType: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("[Guest History API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
