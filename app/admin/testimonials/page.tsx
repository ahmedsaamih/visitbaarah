"use client";

import { useEffect, useState } from "react";

export default function AdminTestimonials() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    guestName: "",
    guestCountry: "",
    rating: 5,
    content: "",
    isPublished: false,
    stayDate: "",
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
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
    const url = formData.id ? `/api/admin/testimonials/${formData.id}` : "/api/admin/testimonials";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditing(false);
        setFormData({ guestName: "", guestCountry: "", rating: 5, content: "", isPublished: false, stayDate: "" });
        fetchItems();
      }
    } catch (err) {
      alert("Submission failed");
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const togglePublish = async (item: any) => {
    try {
      await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      fetchItems();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Testimonials</h1>
        <button onClick={() => { setIsEditing(true); setFormData({ guestName: "", guestCountry: "", rating: 5, content: "", isPublished: false, stayDate: "" }); }} className="btn btn-primary">
          Add Testimonial
        </button>
      </div>

      {isEditing && (
        <div className="card">
          <h2>{formData.id ? "Edit" : "Add"} Testimonial</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Guest Name</label>
                <input value={formData.guestName} onChange={e => setFormData({ ...formData, guestName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Guest Country</label>
                <input value={formData.guestCountry} onChange={e => setFormData({ ...formData, guestCountry: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Rating (1-5)</label>
                <input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label>Stay Date (Optional)</label>
                <input type="date" value={formData.stayDate ? formData.stayDate.split('T')[0] : ""} onChange={e => setFormData({ ...formData, stayDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Review Content</label>
              <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} rows={3} required />
            </div>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} style={{ width: "auto" }} />
                Published (Visible on public site)
              </label>
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
                <th>Guest</th>
                <th>Rating</th>
                <th>Content</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: "600" }}>
                    {item.guestName}
                    <div style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>{item.guestCountry}</div>
                  </td>
                  <td>{"⭐".repeat(item.rating)}</td>
                  <td style={{ maxWidth: "300px", fontSize: "13px" }}>{item.content}</td>
                  <td>
                    <button 
                      onClick={() => togglePublish(item)}
                      className={`badge ${item.isPublished ? 'badge-confirmed' : 'badge-cancelled'}`}
                      style={{ border: "none", cursor: "pointer" }}
                    >
                      {item.isPublished ? "Yes" : "No"}
                    </button>
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
