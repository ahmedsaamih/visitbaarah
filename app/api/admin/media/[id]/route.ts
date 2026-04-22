import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    
    // 1. Get the record to find the blob URL
    const [item] = await db.select().from(media).where(eq(media.id, id));
    
    if (!item) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // 2. Delete from Vercel Blob
    if (item.url.includes("public.blob.vercel-storage.com")) {
      try {
        await del(item.url);
      } catch (blobError) {
        console.error("[Media Delete] Failed to delete blob:", blobError);
        // Continue to delete from DB even if blob is already gone
      }
    }

    // 3. Delete from DB
    await db.delete(media).where(eq(media.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Media Delete API] Error:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
