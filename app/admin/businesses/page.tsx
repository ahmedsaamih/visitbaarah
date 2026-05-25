"use client";

import { useEffect, useState } from "react";

const BUSINESS_TYPES = [
  { value: "guesthouse", label: "Guesthouse" },
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe",       label: "Café" },
  { value: "transport",  label: "Transport" },
  { value: "tour_guide", label: "Tour Guide" },
  { value: "dive_shop",  label: "Dive Shop" },
  { value: "grocery",    label: "Grocery" },
  { value: "spa",        label: "Spa" },
  { value: "other",      label: "Other" },
];

const CONNECT_TYPES = ["whatsapp", "phone", "instagram", "website", "viber"];

const emptyForm = {
  name: "", slug: "", businessType: "other", description: "", shortDescription: "",
  coverPhotoUrl: "", contactEmail: "", contactPhone: "", address: "",
  connectLinks: [] as { type: string; value: string }[],
  isFeatured: false, isActive: true, sortOrder: 0,
};

type Tab = "listings" | "inquiries" | "bookings";

export default function AdminBusinesses() {
  const [items, setItems]       = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [bizBookings, setBizBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab]           = useState<Tab>("listings");
  const [formData, setFormData] = useState<any>({ ...emptyForm });
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [bizRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/businesses"),
        fetch("/api/admin/bookings"),
      ]);
      const data = bizRes.ok ? await bizRes.json() : [];
      setItems(data);
      const allInquiries = data.flatMap((b: any) =>
        (b.inquiries || []).map((i: any) => ({ ...i, businessName: b.name }))
      );
      setInquiries(allInquiries.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      if (bookingsRes.ok) {
        const allBookings = await bookingsRes.json();
        setBizBookings(allBookings.filter((bk: any) => bk.business));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const set = (k: string, v: any) => setFormData((f: any) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id ? `/api/admin/businesses/${formData.id}` : "/api/admin/businesses";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditing(false);
        setFormData({ ...emptyForm });
        fetchItems();
      } else {
        alert("Save failed");
      }
    } catch { alert("Save failed"); }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Delete this business? This cannot be undone.")) return;
    await fetch(`/api/admin/businesses/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const toggleField = async (id: number, field: "isActive" | "isFeatured", current: boolean) => {
    await fetch(`/api/admin/businesses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !current }),
    });
    fetchItems();
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("entityType", "business");
      fd.append("entityId", "0");
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        set("coverPhotoUrl", data.url);
      }
    } finally { setUploading(false); }
  };

  const addLink = () => set("connectLinks", [...(formData.connectLinks || []), { type: "whatsapp", value: "" }]);
  const updateLink = (i: number, k: "type" | "value", v: string) => {
    const links = [...(formData.connectLinks || [])];
    links[i] = { ...links[i], [k]: v };
    set("connectLinks", links);
  };
  const removeLink = (i: number) => set("connectLinks", (formData.connectLinks || []).filter((_: any, idx: number) => idx !== i));

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Businesses</h1>
        <button
          onClick={() => { setIsEditing(true); setFormData({ ...emptyForm }); setTab("listings"); }}
          className="btn btn-primary"
        >
          Add Business
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <button onClick={() => setTab("listings")} className={`btn ${tab === "listings" ? "btn-primary" : "btn-outline"}`} style={{ padding: "6px 16px" }}>
          Listings ({items.length})
        </button>
        <button onClick={() => setTab("inquiries")} className={`btn ${tab === "inquiries" ? "btn-primary" : "btn-outline"}`} style={{ padding: "6px 16px" }}>
          Inquiries ({inquiries.filter(i => i.status === "new").length} new)
        </button>
        <button onClick={() => setTab("bookings")} className={`btn ${tab === "bookings" ? "btn-primary" : "btn-outline"}`} style={{ padding: "6px 16px" }}>
          Bookings ({bizBookings.length})
        </button>
      </div>

      {/* Form */}
      {isEditing && (
        <div className="card">
          <h2 style={{ marginBottom: "20px" }}>{formData.id ? "Edit" : "Add"} Business</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Name *</label>
                <input value={formData.name} onChange={e => set("name", e.target.value)} onBlur={() => { if (!formData.id) set("slug", formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} required />
              </div>
              <div className="form-group">
                <label>Slug *</label>
                <input value={formData.slug} onChange={e => set("slug", e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select value={formData.businessType} onChange={e => set("businessType", e.target.value)} required>
                  {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Short Description</label>
                <input value={formData.shortDescription} onChange={e => set("shortDescription", e.target.value)} maxLength={255} />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input type="email" value={formData.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input type="tel" value={formData.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Sort Order</label>
                <input type="number" value={formData.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input value={formData.address} onChange={e => set("address", e.target.value)} />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={formData.description} onChange={e => set("description", e.target.value)} rows={4} />
            </div>

            <div className="form-group">
              <label>Cover Photo</label>
              {formData.coverPhotoUrl && (
                <img src={formData.coverPhotoUrl} alt="Cover" style={{ height: "80px", borderRadius: "6px", marginBottom: "8px", display: "block", objectFit: "cover" }} />
              )}
              <input type="file" accept="image/*" onChange={uploadCover} disabled={uploading} />
              {uploading && <span style={{ fontSize: "12px", color: "var(--text-light)" }}>Uploading…</span>}
              <div style={{ marginTop: "8px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-light)" }}>Or paste URL</label>
                <input value={formData.coverPhotoUrl} onChange={e => set("coverPhotoUrl", e.target.value)} placeholder="https://…" style={{ marginTop: "4px" }} />
              </div>
            </div>

            {/* Connect Links */}
            <div className="form-group">
              <label>Connect Links</label>
              {(formData.connectLinks || []).map((link: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <select value={link.type} onChange={e => updateLink(i, "type", e.target.value)} style={{ width: "130px" }}>
                    {CONNECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input value={link.value} onChange={e => updateLink(i, "value", e.target.value)} placeholder={link.type === "whatsapp" ? "+960 xxx xxxx" : link.type === "instagram" ? "@username" : "URL"} style={{ flex: 1 }} />
                  <button type="button" onClick={() => removeLink(i)} className="btn btn-outline" style={{ padding: "4px 8px", color: "var(--admin-error)" }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={addLink} className="btn btn-outline" style={{ padding: "4px 12px", fontSize: "12px" }}>+ Add link</button>
            </div>

            <div style={{ display: "flex", gap: "24px", marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
                <input type="checkbox" checked={formData.isActive} onChange={e => set("isActive", e.target.checked)} />
                Active
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
                <input type="checkbox" checked={formData.isFeatured} onChange={e => set("isFeatured", e.target.checked)} />
                Featured on homepage
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Listings tab */}
      {tab === "listings" && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Featured</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{BUSINESS_TYPES.find(t => t.value === item.businessType)?.label || item.businessType}</td>
                    <td>
                      <button onClick={() => toggleField(item.id, "isFeatured", item.isFeatured)} className="btn btn-outline" style={{ padding: "3px 10px", fontSize: "12px" }}>
                        {item.isFeatured ? "★ Featured" : "☆ Feature"}
                      </button>
                    </td>
                    <td>
                      <button onClick={() => toggleField(item.id, "isActive", item.isActive)} className={`badge ${item.isActive ? "badge-confirmed" : "badge-cancelled"}`} style={{ cursor: "pointer", border: "none" }}>
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => { setIsEditing(true); setFormData({ ...item }); }} className="btn btn-outline" style={{ padding: "4px 8px" }}>Edit</button>
                        <a href={`/businesses/${item.slug}`} target="_blank" className="btn btn-outline" style={{ padding: "4px 8px" }}>View</a>
                        <button onClick={() => deleteItem(item.id)} className="btn btn-outline" style={{ padding: "4px 8px", color: "var(--admin-error)" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-light)" }}>No businesses yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiries tab */}
      {tab === "inquiries" && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>From</th>
                  <th>Contact</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map(inq => (
                  <tr key={inq.id}>
                    <td style={{ fontWeight: 600 }}>{inq.businessName}</td>
                    <td>{inq.name}</td>
                    <td style={{ fontSize: "13px" }}>
                      {inq.email && <div>{inq.email}</div>}
                      {inq.phone && <div>{inq.phone}</div>}
                    </td>
                    <td style={{ maxWidth: "260px", fontSize: "13px", color: "var(--text-light)" }}>
                      {inq.message?.slice(0, 120)}{inq.message?.length > 120 ? "…" : ""}
                    </td>
                    <td style={{ fontSize: "12px" }}>{new Date(inq.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${inq.status === "new" ? "badge-pending" : inq.status === "replied" ? "badge-confirmed" : "badge-cancelled"}`}>
                        {inq.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {inquiries.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-light)" }}>No inquiries yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="card">
          <p style={{ fontSize: "13px", color: "var(--admin-text-light)", marginBottom: "16px" }}>
            Bookings submitted through business pages. Manage and update status in{" "}
            <a href="/admin/bookings" style={{ color: "var(--admin-accent)" }}>Bookings</a>.
          </p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>REF</th>
                  <th>Business</th>
                  <th>Guest</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bizBookings.map((bk: any) => (
                  <tr key={bk.id}>
                    <td style={{ fontWeight: 600, fontSize: "12px" }}>{bk.referenceId}</td>
                    <td style={{ fontWeight: 600 }}>{bk.business?.name ?? "—"}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{bk.guestName}</div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>{bk.guestEmail}</div>
                    </td>
                    <td>{new Date(bk.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(bk.checkOut).toLocaleDateString()}</td>
                    <td>{bk.numGuests}</td>
                    <td>
                      <span className={`badge badge-${bk.status}`}>{bk.status}</span>
                    </td>
                  </tr>
                ))}
                {bizBookings.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-light)" }}>
                    No business bookings yet. They appear here when guests book via a business page.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
