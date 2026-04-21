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
    const entityType = formData.get("entityType") as string;
    const entityId = formData.get("entityId") as string;
    const type = formData.get("type") as "image" | "video";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let buffer = Buffer.from(await file.arrayBuffer());
    let filename = file.name;

    // 1. Image Optimization with Sharp
    if (type === "image" || file.type.startsWith("image/")) {
      console.log(`[Media Upload] Optimizing image: ${file.name}`);
      const optimized = await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true }) // Max 1920px width
        .jpeg({ quality: 80, mozjpeg: true }) // High quality compression
        .toBuffer();
      
      buffer = optimized;
      // Change extension to .jpg for consistency if it was something else
      filename = filename.replace(/\.[^/.]+$/, "") + ".jpg";
    }

    // 2. Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: type === "image" ? "image/jpeg" : file.type,
    });

    // 3. Save to Media table
    const [newMedia] = await db
      .insert(media)
      .values({
        url: blob.url,
        entityType: entityType || "general",
        entityId: entityId ? parseInt(entityId) : 0,
        type: type || "image",
        alt: filename,
      })
      .returning();

    return NextResponse.json(newMedia);
  } catch (error) {
    console.error("[Media Upload API] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
