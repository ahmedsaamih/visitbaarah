import { put, del } from "@vercel/blob";

/**
 * Upload a file to Vercel Blob.
 * @param path The path/filename for the blob (e.g. "gallery/room-1.jpg")
 * @param file The file object (Buffer, Blob, File, etc.)
 */
export async function uploadToBlob(path: string, file: File | Buffer) {
  try {
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob;
  } catch (error) {
    console.error("[Blob] Upload failed:", error);
    throw error;
  }
}

/**
 * Delete a file from Vercel Blob.
 * @param url The full URL of the blob to delete.
 */
export async function deleteFromBlob(url: string) {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error("[Blob] Delete failed:", error);
    return false;
  }
}
