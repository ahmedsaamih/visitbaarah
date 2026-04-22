"use client";

import { useEffect, useState } from "react";
import MediaManager from "@/components/admin/MediaManager";

export default function AdminRoomTypes() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    maxGuests: 2,
    bedType: "",
    size: "",
    amenities: [],
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/room-types");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id ? `/api/admin/room-types/${formData.id}` : "/api/admin/room-types";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditing(false);
        setFormData({ name: "", slug: "", description: "", basePrice: "", maxGuests: 2, bedType: "", size: "", amenities: [] });
        fetchItems();
      }
    } catch (err) {
      alert("Submission failed");
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/room-types/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Room Types</h1>
        <button onClick={() => { setIsEditing(true); setFormData({ name: "", slug: "", description: "", basePrice: "", maxGuests: 2, bedType: "", size: "", amenities: [] }); }} className="btn btn-primary">
          Add Room Type
        </button>
      </div>

      {isEditing && (
        <div className="card">
          <h2>{formData.id ? "Edit" : "Add"} Room Type</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Name</label>
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, "-") })} required />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Base Price ($)</label>
                <input type="number" step="0.01" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Max Guests</label>
                <input type="number" value={formData.maxGuests} onChange={e => setFormData({ ...formData, maxGuests: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Bed Type</label>
                <input value={formData.bedType} onChange={e => setFormData({ ...formData, bedType: e.target.value })} placeholder="e.g. King Size" />
              </div>
              <div className="form-group">
                <label>Size</label>
                <input value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} placeholder="e.g. 35 sqm" />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            
            {formData.id && (
              <MediaManager entityType="room_type" entityId={formData.id} />
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">Cancel</button>
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
                <th>Base Price</th>
                <th>Max Guests</th>
                <th>Bed Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: "600" }}>{item.name}</td>
                  <td>${item.basePrice}</td>
                  <td>{item.maxGuests}</td>
                  <td>{item.bedType || "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => { setIsEditing(true); setFormData(item); }} className="btn btn-outline" style={{ padding: "4px 8px" }}>Edit</button>
                      <button onClick={() => deleteItem(item.id)} className="btn btn-outline" style={{ padding: "4px 8px", color: "var(--admin-error)" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
