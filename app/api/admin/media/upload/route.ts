import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/db";
import { media } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import sharp from "sharp";

export async function POST(request: Request) {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const entityType = formData.get("entity_type") as string;
    const entityId = formData.get("entity_id") as string;
    const type = formData.get("type") as "image" | "video" || "image";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Size Limit (10MB for images, 50MB for videos)
    const limit = type === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > limit) {
      return NextResponse.json({ error: `File too large. Max ${type === "image" ? "10MB" : "50MB"}` }, { status: 400 });
    }

    let buffer = Buffer.from(await file.arrayBuffer());
    let filename = file.name || "upload";

    // 2. Image Optimization with Sharp
    if (type === "image" && file.type.startsWith("image/")) {
      try {
        console.log(`[Media Upload] Optimizing image: ${filename}`);
        const optimized = await sharp(buffer)
          .rotate() // Auto-rotate based on EXIF
          .resize({ width: 1920, withoutEnlargement: true })
          .jpeg({ quality: 85, mozjpeg: true, progressive: true })
          .toBuffer();
        
        buffer = optimized;
        filename = filename.replace(/\.[^/.]+$/, "") + ".jpg";
      } catch (err) {
        console.warn("[Media Upload] Sharp failed, using raw buffer:", err);
        // Continue with original buffer if sharp fails (fallback)
      }
    }

    // 3. Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: type === "image" ? "image/jpeg" : file.type,
    });

    // 4. Save to Media table
    const [newMedia] = await db
      .insert(media)
      .values({
        url: blob.url,
        entityType: entityType || "general",
        entityId: entityId ? parseInt(entityId) : 0,
        type,
        alt: filename,
      })
      .returning();

    return NextResponse.json(newMedia);
  } catch (error) {
    console.error("[Media Upload API] Error:", error);
    return NextResponse.json({ error: "Upload failed. Please check file format and try again." }, { status: 500 });
  }
}
