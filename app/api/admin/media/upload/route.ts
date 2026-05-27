import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { put } from "@vercel/blob";
import { db } from "@/db";
import { media } from "@/db/schema";
import { verifySession } from "@/lib/auth";

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
    const type = (formData.get("type") as "image" | "video") || "image";
    const explicitContentType = formData.get("content_type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Size Limit (10MB for images, 50MB for videos)
    const limit = type === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > limit) {
      return NextResponse.json({ error: `File too large. Max ${type === "image" ? "10MB" : "50MB"}` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name || "upload";
    const contentType =
      explicitContentType ||
      file.type ||
      (type === "image" ? "image/jpeg" : "application/octet-stream");

    // 3. Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType,
    });

    // 4. Save to Media table with specific relations
    const mediaValues: any = {
      url: blob.url,
      entityType: entityType || "general",
      entityId: entityId ? parseInt(entityId) : 0,
      type,
      alt: filename,
    };

    const id = entityId ? parseInt(entityId) : 0;
    if (id > 0) {
      if (entityType === "room_type") mediaValues.roomTypeId = id;
      else if (entityType === "activity") mediaValues.activityId = id;
      else if (entityType === "tour") mediaValues.tourId = id;
      else if (entityType === "service") mediaValues.serviceId = id;
      else if (entityType === "cultural_event") mediaValues.culturalEventId = id;
    }

    const [newMedia] = await db
      .insert(media)
      .values(mediaValues)
      .returning();

    revalidateTag("homepage", "max");
    return NextResponse.json(newMedia);
  } catch (error) {
    console.error("[Media Upload API] Error:", error);
    return NextResponse.json({ error: "Upload failed. Please check file format and try again." }, { status: 500 });
  }
}
