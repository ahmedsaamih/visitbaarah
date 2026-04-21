"use client";

import { useEffect, useState } from "react";

export default function AdminGallery() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.ok ? await res.json() : [];
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", "gallery");
    formData.append("entityId", "0"); // 0 for general gallery
    formData.append("type", "image");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchItems();
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      alert("Error uploading");
    } finally {
      setUploading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Gallery</h1>
        <div style={{ position: "relative" }}>
          <button className="btn btn-primary" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          <input 
            type="file" 
            onChange={handleUpload}
            style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              width: "100%", 
              height: "100%", 
              opacity: 0, 
              cursor: "pointer" 
            }}
            accept="image/*"
            disabled={uploading}
          />
        </div>
      </div>

      <div className="card">
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
          gap: "20px" 
        }}>
          {items.map((item) => (
            <div key={item.id} style={{ 
              position: "relative",
              border: "1px solid var(--admin-border)",
              borderRadius: "12px",
              overflow: "hidden",
              aspectRatio: "1/1",
              background: "#000"
            }}>
              <img 
                src={item.url} 
                alt={item.alt} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ 
                position: "absolute", 
                bottom: 0, 
                left: 0, 
                width: "100%", 
                padding: "8px", 
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "12px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.caption || "No caption"}
                </span>
                <button 
                  onClick={() => deleteItem(item.id)}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    color: "#ff4d4d", 
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--admin-text-light)" }}>
              No images in gallery yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
