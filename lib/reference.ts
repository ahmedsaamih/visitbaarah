import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Generate a unique booking reference ID.
 * Format: "GH" + 6 uppercase alphanumeric characters.
 * Checks for collisions against the database.
 */
export async function generateReferenceId(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let ref = "GH";
    for (let i = 0; i < 6; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check for collision
    const existing = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.referenceId, ref))
      .limit(1);

    if (existing.length === 0) {
      return ref;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique reference ID after max attempts");
}
