"use client";

import { useEffect, useState } from "react";
import MediaManager from "@/components/admin/MediaManager";

export default function AdminMenu() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    price: "",
    category: "breakfast",
    isVegetarian: false,
    isAvailable: true,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/menu");
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
    const url = formData.id ? `/api/admin/menu/${formData.id}` : "/api/admin/menu";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditing(false);
        setFormData({ name: "", description: "", price: "", category: "breakfast", isVegetarian: false, isAvailable: true });
        fetchItems();
      }
    } catch (err) {
      alert("Submission failed");
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Restaurant Menu</h1>
        <button onClick={() => { setIsEditing(true); setFormData({ name: "", description: "", price: "", category: "breakfast", isVegetarian: false, isAvailable: true }); }} className="btn btn-primary">
          Add Menu Item
        </button>
      </div>

      {isEditing && (
        <div className="card">
          <h2>{formData.id ? "Edit" : "Add"} Menu Item</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Name</label>
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="drinks">Drinks</option>
                  <option value="desserts">Desserts</option>
                  <option value="snacks">Snacks</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "24px" }}>
                <label style={{ margin: 0, cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.isVegetarian} onChange={e => setFormData({ ...formData, isVegetarian: e.target.checked })} style={{ width: "auto", marginRight: "8px" }} />
                   Vegetarian
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>

            {formData.id && (
              <MediaManager entityType="menu" entityId={formData.id} />
            )}
            <div style={{ display: "flex", gap: "12px" }}>
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
                <th>Category</th>
                <th>Price</th>
                <th>Veg</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: "600" }}>{item.name}</td>
                  <td style={{ textTransform: "capitalize" }}>{item.category}</td>
                  <td>${item.price}</td>
                  <td>{item.isVegetarian ? "🌱" : "-"}</td>
                  <td>
                    <span className={`badge ${item.isAvailable ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {item.isAvailable ? "Available" : "Sold Out"}
                    </span>
                  </td>
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
