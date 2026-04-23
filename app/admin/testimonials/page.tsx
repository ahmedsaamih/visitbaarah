"use client";

import { useEffect, useState } from "react";

type ReviewStatus = "pending" | "submitted" | "approved" | "rejected";

type TestimonialItem = {
  id: number;
  guestName: string;
  guestCountry: string;
  rating: number;
  content: string;
  isPublished: boolean;
  isFeatured: boolean;
  reviewStatus: ReviewStatus;
  stayDate: string;
  booking?: {
    referenceId?: string;
  };
};

type TestimonialFormData = Omit<TestimonialItem, "id"> & { id?: number };

const EMPTY_FORM: TestimonialFormData = {
  guestName: "",
  guestCountry: "",
  rating: 5,
  content: "",
  isPublished: false,
  isFeatured: false,
  reviewStatus: "approved",
  stayDate: "",
};

export default function AdminTestimonials() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TestimonialFormData>(EMPTY_FORM);

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
    const timer = setTimeout(() => {
      void fetchItems();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id ? `/api/admin/testimonials/${formData.id}` : "/api/admin/testimonials";

    try {
      const payload = {
        ...formData,
        isPublished: formData.reviewStatus === "approved" ? !!formData.isPublished : false,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsEditing(false);
        setFormData(EMPTY_FORM);
        fetchItems();
      }
    } catch {
      alert("Submission failed");
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch {
      alert("Delete failed");
    }
  };

  const patchItem = async (id: number, payload: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.error || "Failed to update");
        return;
      }
      fetchItems();
    } catch {
      alert("Failed to update");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Testimonials</h1>
        <button onClick={() => { setIsEditing(true); setFormData(EMPTY_FORM); }} className="btn btn-primary">
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
                <input value={formData.guestCountry || ""} onChange={e => setFormData({ ...formData, guestCountry: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Rating (1-5)</label>
                <input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })} required />
              </div>
              <div className="form-group">
                <label>Stay Date (Optional)</label>
                <input type="date" value={formData.stayDate ? formData.stayDate.split("T")[0] : ""} onChange={e => setFormData({ ...formData, stayDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Review Content</label>
              <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} rows={4} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Review Status</label>
                <select value={formData.reviewStatus || "approved"} onChange={(e) => setFormData({ ...formData, reviewStatus: e.target.value as ReviewStatus })}>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "30px" }}>
                  <input type="checkbox" checked={!!formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} style={{ width: "auto" }} />
                  Feature first on homepage
                </label>
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="checkbox" checked={!!formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} style={{ width: "auto" }} />
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
                <th>Status</th>
                <th>Published</th>
                <th>Featured</th>
                <th>Content</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: "600" }}>
                    {item.guestName}
                    <div style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>{item.guestCountry || "-"}</div>
                    {item.booking?.referenceId ? (
                      <div style={{ fontSize: "11px", color: "var(--admin-accent)" }}>Ref: {item.booking.referenceId}</div>
                    ) : null}
                  </td>
                  <td>{"?".repeat(item.rating || 0)}</td>
                  <td>
                    <span className={`badge ${item.reviewStatus === "approved" ? "badge-confirmed" : item.reviewStatus === "rejected" ? "badge-cancelled" : "badge-pending"}`}>
                      {item.reviewStatus || "approved"}
                    </span>
                  </td>
                  <td>{item.isPublished ? "Yes" : "No"}</td>
                  <td>{item.isFeatured ? "Yes" : "No"}</td>
                  <td style={{ maxWidth: "320px", fontSize: "13px" }}>{item.content || "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button onClick={() => patchItem(item.id, { reviewStatus: "approved", isPublished: true })} className="btn btn-outline" style={{ padding: "4px 8px", borderColor: "var(--admin-success)", color: "var(--admin-success)" }}>Approve</button>
                      <button onClick={() => patchItem(item.id, { reviewStatus: "rejected", isPublished: false, isFeatured: false })} className="btn btn-outline" style={{ padding: "4px 8px", borderColor: "var(--admin-error)", color: "var(--admin-error)" }}>Reject</button>
                      <button onClick={() => patchItem(item.id, { isFeatured: !item.isFeatured })} className="btn btn-outline" style={{ padding: "4px 8px" }} disabled={!item.isPublished || item.reviewStatus !== "approved"}>
                        {item.isFeatured ? "Unfeature" : "Feature"}
                      </button>
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

