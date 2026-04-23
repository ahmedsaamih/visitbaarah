import { NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await db.query.testimonials.findMany({
      orderBy: [desc(testimonials.createdAt)],
      with: {
        booking: true,
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Testimonials API] GET Error:", error);
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
    const [newItem] = await db
      .insert(testimonials)
      .values({
        ...data,
        reviewStatus: data.reviewStatus || "approved",
      })
      .returning();
    revalidateTag("homepage", "max");
    return NextResponse.json(newItem);
  } catch (error) {
    console.error("[Testimonials API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
