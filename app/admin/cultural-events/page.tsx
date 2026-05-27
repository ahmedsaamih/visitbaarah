"use client";

import { useEffect, useState } from "react";
import MediaManager from "@/components/admin/MediaManager";

type CulturalEventItem = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  shortDescription: string | null;
  period: string | null;
  isActive: boolean;
  sortOrder: number;
  media?: { id: number; url: string }[];
};

type FormData = Omit<CulturalEventItem, "id" | "media"> & { id?: number };

function emptyForm(): FormData {
  return {
    name: "",
    slug: "",
    category: "",
    description: "",
    shortDescription: "",
    period: "",
    isActive: true,
    sortOrder: 0,
  };
}

export default function AdminCulturalEvents() {
  const [items, setItems] = useState<CulturalEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm());

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setFormData((f) => ({ ...f, [k]: v }));

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/cultural-events");
      setItems(res.ok ? await res.json() : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => void fetchItems(), 0);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id
      ? `/api/admin/cultural-events/${formData.id}`
      : "/api/admin/cultural-events";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditing(false);
        setFormData(emptyForm());
        fetchItems();
      } else {
        const err = await res.json().catch(() => ({}));
        alert((err as { error?: string }).error || "Save failed");
      }
    } catch {
      alert("Save failed");
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Delete this cultural event?")) return;
    try {
      const res = await fetch(`/api/admin/cultural-events/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Cultural Events</h1>
        <button
          onClick={() => { setIsEditing(true); setFormData(emptyForm()); }}
          className="btn btn-primary"
        >
          Add Event
        </button>
      </div>

      {isEditing && (
        <div className="card">
          <h2>{formData.id ? "Edit" : "Add"} Cultural Event</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug *</label>
                <input
                  value={formData.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  value={formData.category ?? ""}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="e.g. Rites, Music, Sport, Food"
                />
              </div>
              <div className="form-group">
                <label>Period / When</label>
                <input
                  value={formData.period ?? ""}
                  onChange={(e) => set("period", e.target.value)}
                  placeholder="e.g. Eid al-Adha · Bodu Eid"
                />
              </div>
              <div className="form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "24px" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                    style={{ width: "auto" }}
                  />
                  Active (visible on website)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Short Description</label>
              <input
                value={formData.shortDescription ?? ""}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="Brief summary shown on the card (max ~160 chars)"
                maxLength={255}
              />
            </div>

            <div className="form-group">
              <label>Full Description</label>
              <textarea
                value={formData.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Detailed description of the event..."
              />
            </div>

            {formData.id && (
              <MediaManager entityType="cultural_event" entityId={formData.id} />
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Period</th>
                <th>Images</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.category || "—"}</td>
                  <td style={{ fontSize: "13px", color: "var(--admin-text-light)" }}>
                    {item.period || "—"}
                  </td>
                  <td>{item.media?.length ?? 0}</td>
                  <td>
                    <span className={`badge ${item.isActive ? "badge-confirmed" : "badge-cancelled"}`}>
                      {item.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => { setIsEditing(true); setFormData(item); }}
                        className="btn btn-outline"
                        style={{ padding: "4px 8px" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="btn btn-outline"
                        style={{ padding: "4px 8px", color: "var(--admin-error)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--admin-text-light)" }}>
                    No cultural events yet. Add your first event above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
