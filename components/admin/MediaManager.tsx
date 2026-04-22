"use client";

import { useState, useEffect } from "react";

interface MediaItem {
  id: number;
  url: string;
  alt: string | null;
}

interface MediaManagerProps {
  entityType: "room_type" | "activity" | "tour" | "service" | "gallery" | "menu";
  entityId: number;
}

export default function MediaManager({ entityType, entityId }: MediaManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?entityType=${entityType}&entityId=${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      }
    } catch (err) {
      console.error("Failed to fetch media", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId || entityType === "gallery") fetchMedia();
  }, [entityId, entityType]);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 2000;
          const MAX_HEIGHT = 2000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas toBlob failed"));
          }, "image/jpeg", 0.82);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      let finalFile: Blob | File = file;
      let filename = file.name;
      let contentType = file.type || "application/octet-stream";

      if (file.type.startsWith("image/")) {
        try {
          finalFile = await compressImage(file);
          filename = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
          contentType = "image/jpeg";
        } catch (compressionError) {
          // Fallback to the original file if compression fails for specific formats/devices.
          console.warn("[MediaManager] Compression failed, uploading original file.", compressionError);
          finalFile = file;
          filename = file.name;
          contentType = file.type || "application/octet-stream";
        }
      }

      const formData = new FormData();
      formData.append("file", finalFile, filename);
      formData.append("entity_type", entityType);
      formData.append("entity_id", entityId.toString());
      formData.append("type", file.type.startsWith("video/") ? "video" : "image");
      formData.append("content_type", contentType);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        fetchMedia();
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try a smaller image or a different format.");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const deleteMedia = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (res.ok) fetchMedia();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (!entityId && entityType !== "gallery") return <p className="text-sm text-gray-500">Save the item first to manage images.</p>;

  return (
    <div className="media-manager" style={{ marginTop: "24px", borderTop: "1px solid var(--admin-border)", paddingTop: "24px" }}>
      <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Manage Images</h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        {media.map((item) => (
          <div key={item.id} style={{ position: "relative", aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--admin-border)" }}>
            <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button 
              onClick={() => deleteMedia(item.id)}
              style={{ 
                position: "absolute", 
                top: "4px", 
                right: "4px", 
                background: "rgba(255,0,0,0.8)", 
                color: "#fff", 
                border: "none", 
                borderRadius: "4px", 
                padding: "2px 6px", 
                fontSize: "10px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>
        ))}

        <label style={{ 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center", 
          aspectRatio: "1/1", 
          borderRadius: "8px", 
          border: "2px dashed var(--admin-border)", 
          cursor: "pointer",
          fontSize: "12px",
          color: "var(--admin-text-light)",
          background: "#fff"
        }}>
          {uploading ? (
            <span>Uploading...</span>
          ) : (
            <>
              <span style={{ fontSize: "24px", marginBottom: "4px" }}>+</span>
              <span>Upload Image</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
        </label>
      </div>
      <p style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>Images are automatically compressed for best performance.</p>
    </div>
  );
}
