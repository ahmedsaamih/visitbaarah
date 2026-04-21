"use client";

import { useEffect, useState } from "react";

export default function AdminTours() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    description: "",
    price: "",
    priceUnit: "per_person",
    duration: "",
    isActive: true,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/tours");
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
    const url = formData.id ? `/api/admin/tours/${formData.id}` : "/api/admin/tours";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditing(false);
        setFormData({ name: "", slug: "", description: "", price: "", priceUnit: "per_person", duration: "", isActive: true });
        fetchItems();
      }
    } catch (err) {
      alert("Submission failed");
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/tours/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Tours</h1>
        <button onClick={() => { setIsEditing(true); setFormData({ name: "", slug: "", description: "", price: "", priceUnit: "per_person", duration: "", isActive: true }); }} className="btn btn-primary">
          Add Tour
        </button>
      </div>

      {isEditing && (
        <div className="card">
          <h2>{formData.id ? "Edit" : "Add"} Tour</h2>
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
                <label>Price ($)</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Price Unit</label>
                <select value={formData.priceUnit} onChange={e => setFormData({ ...formData, priceUnit: e.target.value })} required>
                  <option value="per_person">Per Person</option>
                  <option value="per_hour">Per Hour</option>
                  <option value="flat">Flat Rate</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
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
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: "600" }}>{item.name}</td>
                  <td>${item.price} {item.priceUnit.replace("_", " ")}</td>
                  <td>
                    <span className={`badge ${item.isActive ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {item.isActive ? "Active" : "Inactive"}
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
