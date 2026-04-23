import { NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const review = await db.query.testimonials.findFirst({
      where: and(
        eq(testimonials.reviewToken, token),
        gt(testimonials.reviewTokenExpiresAt, new Date()),
        eq(testimonials.reviewStatus, "pending")
      ),
      with: {
        booking: true,
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review link is invalid or expired." }, { status: 404 });
    }

    return NextResponse.json({
      id: review.id,
      guestName: review.guestName,
      guestCountry: review.guestCountry || review.booking?.guestCountry || "",
      checkIn: review.booking?.checkIn,
      checkOut: review.booking?.checkOut,
      referenceId: review.booking?.referenceId,
      roomTypeId: review.booking?.roomTypeId,
      stayDate: review.stayDate || review.booking?.checkOut || null,
      expiresAt: review.reviewTokenExpiresAt,
    });
  } catch (error) {
    console.error("[Public Reviews API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const body = await request.json();
    const rating = Number(body.rating);
    const content = String(body.content || "").trim();
    const guestCountry = body.guestCountry ? String(body.guestCountry).trim() : null;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }
    if (!content || content.length < 10) {
      return NextResponse.json({ error: "Review must be at least 10 characters." }, { status: 400 });
    }

    const review = await db.query.testimonials.findFirst({
      where: and(
        eq(testimonials.reviewToken, token),
        gt(testimonials.reviewTokenExpiresAt, new Date()),
        eq(testimonials.reviewStatus, "pending")
      ),
    });

    if (!review) {
      return NextResponse.json({ error: "Review link is invalid or expired." }, { status: 404 });
    }

    await db
      .update(testimonials)
      .set({
        rating,
        content,
        guestCountry: guestCountry || review.guestCountry,
        reviewStatus: "submitted",
        reviewSubmittedAt: new Date(),
        isPublished: false,
        reviewToken: null,
        reviewTokenExpiresAt: null,
      })
      .where(eq(testimonials.id, review.id));

    return NextResponse.json({ success: true, message: "Review submitted for approval." });
  } catch (error) {
    console.error("[Public Reviews API] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
