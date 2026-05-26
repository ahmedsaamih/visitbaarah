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

const emptyRoomTypeForm = {
  name: "", slug: "", description: "", shortDescription: "",
  basePrice: "", maxGuests: 2, bedType: "", size: "", isActive: true, sortOrder: 0,
};

const emptyRoomForm = {
  roomNumber: "", roomTypeId: "", floor: "", status: "available", notes: "",
};

type Tab = "listings" | "inquiries" | "bookings" | "rooms";
type RoomsSubTab = "room-types" | "rooms";

export default function AdminBusinesses() {
  const [items, setItems]       = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [bizBookings, setBizBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab]           = useState<Tab>("listings");
  const [formData, setFormData] = useState<any>({ ...emptyForm });
  const [uploading, setUploading] = useState(false);

  // Rooms tab state
  const [selectedBizId, setSelectedBizId] = useState<number | null>(null);
  const [roomsSubTab, setRoomsSubTab] = useState<RoomsSubTab>("room-types");
  const [bizRoomTypes, setBizRoomTypes] = useState<any[]>([]);
  const [bizRooms, setBizRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [isEditingRoomType, setIsEditingRoomType] = useState(false);
  const [roomTypeForm, setRoomTypeForm] = useState<any>({ ...emptyRoomTypeForm });
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomForm, setRoomForm] = useState<any>({ ...emptyRoomForm });
  const [roomSaveError, setRoomSaveError] = useState("");

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

  const fetchBizRooms = async (bizId: number) => {
    setRoomsLoading(true);
    try {
      const [rtRes, rRes] = await Promise.all([
        fetch(`/api/admin/businesses/${bizId}/room-types`),
        fetch(`/api/admin/businesses/${bizId}/rooms`),
      ]);
      setBizRoomTypes(rtRes.ok ? await rtRes.json() : []);
      setBizRooms(rRes.ok ? await rRes.json() : []);
    } catch (err) {
      console.error(err);
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    if (tab === "rooms") {
      const guesthouseList = items.filter((b) => b.businessType === "guesthouse");
      if (!selectedBizId && guesthouseList.length === 1) {
        setSelectedBizId(guesthouseList[0].id);
      }
    }
  }, [tab, items]);

  useEffect(() => {
    if (tab === "rooms" && selectedBizId) {
      fetchBizRooms(selectedBizId);
      setIsEditingRoomType(false);
      setIsEditingRoom(false);
      setRoomTypeForm({ ...emptyRoomTypeForm });
      setRoomForm({ ...emptyRoomForm });
      setRoomSaveError("");
    }
  }, [tab, selectedBizId]);

  const set = (k: string, v: any) => setFormData((f: any) => ({ ...f, [k]: v }));
  const setRt = (k: string, v: any) => setRoomTypeForm((f: any) => ({ ...f, [k]: v }));
  const setR = (k: string, v: any) => setRoomForm((f: any) => ({ ...f, [k]: v }));

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

  // Room type CRUD
  const saveRoomType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId) return;
    setRoomSaveError("");
    const method = roomTypeForm.id ? "PATCH" : "POST";
    const url = roomTypeForm.id
      ? `/api/admin/room-types/${roomTypeForm.id}`
      : `/api/admin/businesses/${selectedBizId}/room-types`;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...roomTypeForm, basePrice: String(roomTypeForm.basePrice) }),
      });
      if (res.ok) {
        setIsEditingRoomType(false);
        setRoomTypeForm({ ...emptyRoomTypeForm });
        fetchBizRooms(selectedBizId);
      } else {
        const err = await res.json();
        setRoomSaveError(err.error || "Save failed");
      }
    } catch { setRoomSaveError("Save failed"); }
  };

  const deleteRoomType = async (id: number) => {
    if (!selectedBizId) return;
    if (!confirm("Delete this room type? All associated rooms will also be removed.")) return;
    await fetch(`/api/admin/room-types/${id}`, { method: "DELETE" });
    fetchBizRooms(selectedBizId);
  };

  // Room CRUD
  const saveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId) return;
    setRoomSaveError("");
    const method = roomForm.id ? "PATCH" : "POST";
    const url = roomForm.id
      ? `/api/admin/rooms/${roomForm.id}`
      : `/api/admin/businesses/${selectedBizId}/rooms`;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...roomForm, roomTypeId: Number(roomForm.roomTypeId), floor: roomForm.floor ? Number(roomForm.floor) : null }),
      });
      if (res.ok) {
        setIsEditingRoom(false);
        setRoomForm({ ...emptyRoomForm });
        fetchBizRooms(selectedBizId);
      } else {
        const err = await res.json();
        setRoomSaveError(err.error || "Save failed");
      }
    } catch { setRoomSaveError("Save failed"); }
  };

  const deleteRoom = async (id: number) => {
    if (!selectedBizId) return;
    if (!confirm("Delete this room?")) return;
    await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" });
    fetchBizRooms(selectedBizId);
  };

  const guesthouses = items.filter((b) => b.businessType === "guesthouse");

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
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button onClick={() => setTab("listings")} className={`btn ${tab === "listings" ? "btn-primary" : "btn-outline"}`} style={{ padding: "6px 16px" }}>
          Listings ({items.length})
        </button>
        <button onClick={() => setTab("inquiries")} className={`btn ${tab === "inquiries" ? "btn-primary" : "btn-outline"}`} style={{ padding: "6px 16px" }}>
          Inquiries ({inquiries.filter(i => i.status === "new").length} new)
        </button>
        <button onClick={() => setTab("bookings")} className={`btn ${tab === "bookings" ? "btn-primary" : "btn-outline"}`} style={{ padding: "6px 16px" }}>
          Bookings ({bizBookings.length})
        </button>
        <button onClick={() => setTab("rooms")} className={`btn ${tab === "rooms" ? "btn-primary" : "btn-outline"}`} style={{ padding: "6px 16px" }}>
          Rooms
        </button>
      </div>

      {/* Business form */}
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
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button onClick={() => { setIsEditing(true); setFormData({ ...item }); }} className="btn btn-outline" style={{ padding: "4px 8px" }}>Edit</button>
                        <a href={`/businesses/${item.slug}`} target="_blank" className="btn btn-outline" style={{ padding: "4px 8px" }}>View</a>
                        {item.businessType === "guesthouse" && (
                          <button
                            onClick={() => { setSelectedBizId(item.id); setTab("rooms"); }}
                            className="btn btn-outline"
                            style={{ padding: "4px 8px" }}
                          >
                            Rooms
                          </button>
                        )}
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
                  <th>Business</th><th>From</th><th>Contact</th><th>Message</th><th>Date</th><th>Status</th>
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

      {/* Bookings tab */}
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
                  <th>REF</th><th>Business</th><th>Guest</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Status</th>
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
                    <td><span className={`badge badge-${bk.status}`}>{bk.status}</span></td>
                  </tr>
                ))}
                {bizBookings.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-light)" }}>No business bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rooms tab */}
      {tab === "rooms" && (
        <div>
          {/* Property selector */}
          <div className="card" style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ fontWeight: 600, fontSize: "14px" }}>Property:</label>
              <select
                value={selectedBizId ?? ""}
                onChange={(e) => setSelectedBizId(e.target.value ? Number(e.target.value) : null)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--admin-border)", fontSize: "14px" }}
              >
                <option value="">— Select a guesthouse —</option>
                {guesthouses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {guesthouses.length === 0 && (
                <span style={{ fontSize: "13px", color: "var(--admin-text-light)" }}>
                  No guesthouses yet. Add one in Listings first.
                </span>
              )}
            </div>
          </div>

          {selectedBizId && (
            <>
              {/* Sub-tabs */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <button
                  onClick={() => { setRoomsSubTab("room-types"); setIsEditingRoomType(false); setRoomTypeForm({ ...emptyRoomTypeForm }); setIsEditingRoom(false); setRoomSaveError(""); }}
                  className={`btn ${roomsSubTab === "room-types" ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: "6px 16px" }}
                >
                  Room Types ({bizRoomTypes.length})
                </button>
                <button
                  onClick={() => { setRoomsSubTab("rooms"); setIsEditingRoom(false); setRoomForm({ ...emptyRoomForm }); setIsEditingRoomType(false); setRoomSaveError(""); }}
                  className={`btn ${roomsSubTab === "rooms" ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: "6px 16px" }}
                >
                  Physical Rooms ({bizRooms.length})
                </button>
              </div>

              {roomSaveError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", color: "#dc2626", fontSize: "13px" }}>
                  {roomSaveError}
                </div>
              )}

              {/* Room Types sub-tab */}
              {roomsSubTab === "room-types" && (
                <div>
                  {isEditingRoomType && (
                    <div className="card" style={{ marginBottom: "16px" }}>
                      <h3 style={{ marginBottom: "16px" }}>{roomTypeForm.id ? "Edit" : "Add"} Room Type</h3>
                      <form onSubmit={saveRoomType}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                          <div className="form-group">
                            <label>Name *</label>
                            <input value={roomTypeForm.name} onChange={e => setRt("name", e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label>Base Price ($/night) *</label>
                            <input type="number" step="0.01" value={roomTypeForm.basePrice} onChange={e => setRt("basePrice", e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label>Max Guests</label>
                            <input type="number" value={roomTypeForm.maxGuests} onChange={e => setRt("maxGuests", Number(e.target.value))} min={1} max={10} />
                          </div>
                          <div className="form-group">
                            <label>Bed Type</label>
                            <input value={roomTypeForm.bedType} onChange={e => setRt("bedType", e.target.value)} placeholder="e.g. King, Twin" />
                          </div>
                          <div className="form-group">
                            <label>Size</label>
                            <input value={roomTypeForm.size} onChange={e => setRt("size", e.target.value)} placeholder="e.g. 28 sqm" />
                          </div>
                          <div className="form-group">
                            <label>Sort Order</label>
                            <input type="number" value={roomTypeForm.sortOrder} onChange={e => setRt("sortOrder", Number(e.target.value))} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Short Description</label>
                          <input value={roomTypeForm.shortDescription} onChange={e => setRt("shortDescription", e.target.value)} maxLength={255} />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <textarea value={roomTypeForm.description} onChange={e => setRt("description", e.target.value)} rows={3} />
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                          <input type="checkbox" checked={roomTypeForm.isActive} onChange={e => setRt("isActive", e.target.checked)} />
                          Active
                        </label>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button type="submit" className="btn btn-primary">Save</button>
                          <button type="button" className="btn btn-outline" onClick={() => { setIsEditingRoomType(false); setRoomTypeForm({ ...emptyRoomTypeForm }); setRoomSaveError(""); }}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3>Room Types</h3>
                      {!isEditingRoomType && (
                        <button className="btn btn-primary" onClick={() => { setIsEditingRoomType(true); setRoomTypeForm({ ...emptyRoomTypeForm }); }}>
                          + Add Room Type
                        </button>
                      )}
                    </div>
                    {roomsLoading ? (
                      <div>Loading…</div>
                    ) : (
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Base Price</th>
                              <th>Max Guests</th>
                              <th>Bed Type</th>
                              <th>Active</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bizRoomTypes.map((rt: any) => (
                              <tr key={rt.id}>
                                <td style={{ fontWeight: 600 }}>{rt.name}</td>
                                <td>${rt.basePrice}/night</td>
                                <td>{rt.maxGuests}</td>
                                <td>{rt.bedType || "—"}</td>
                                <td>
                                  <span className={`badge ${rt.isActive ? "badge-confirmed" : "badge-cancelled"}`}>
                                    {rt.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <button className="btn btn-outline" style={{ padding: "4px 8px" }} onClick={() => { setIsEditingRoomType(true); setRoomTypeForm({ ...rt }); }}>Edit</button>
                                    <button className="btn btn-outline" style={{ padding: "4px 8px", color: "var(--admin-error)" }} onClick={() => deleteRoomType(rt.id)}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {bizRoomTypes.length === 0 && (
                              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-light)" }}>No room types yet. Add one to enable full availability tracking.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Physical Rooms sub-tab */}
              {roomsSubTab === "rooms" && (
                <div>
                  {isEditingRoom && (
                    <div className="card" style={{ marginBottom: "16px" }}>
                      <h3 style={{ marginBottom: "16px" }}>{roomForm.id ? "Edit" : "Add"} Room</h3>
                      <form onSubmit={saveRoom}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                          <div className="form-group">
                            <label>Room Number *</label>
                            <input value={roomForm.roomNumber} onChange={e => setR("roomNumber", e.target.value)} required placeholder="e.g. 101, A1" />
                          </div>
                          <div className="form-group">
                            <label>Room Type *</label>
                            <select value={roomForm.roomTypeId} onChange={e => setR("roomTypeId", e.target.value)} required>
                              <option value="">— Select —</option>
                              {bizRoomTypes.map((rt: any) => (
                                <option key={rt.id} value={rt.id}>{rt.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Floor</label>
                            <input type="number" value={roomForm.floor} onChange={e => setR("floor", e.target.value)} placeholder="e.g. 1" />
                          </div>
                          <div className="form-group">
                            <label>Status</label>
                            <select value={roomForm.status} onChange={e => setR("status", e.target.value)}>
                              <option value="available">Available</option>
                              <option value="occupied">Occupied</option>
                              <option value="maintenance">Maintenance</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Notes</label>
                          <textarea value={roomForm.notes} onChange={e => setR("notes", e.target.value)} rows={2} />
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button type="submit" className="btn btn-primary">Save</button>
                          <button type="button" className="btn btn-outline" onClick={() => { setIsEditingRoom(false); setRoomForm({ ...emptyRoomForm }); setRoomSaveError(""); }}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3>Physical Rooms</h3>
                      {!isEditingRoom && (
                        <button className="btn btn-primary" onClick={() => { setIsEditingRoom(true); setRoomForm({ ...emptyRoomForm }); }} disabled={bizRoomTypes.length === 0}>
                          + Add Room
                        </button>
                      )}
                    </div>
                    {bizRoomTypes.length === 0 && !isEditingRoom && (
                      <p style={{ fontSize: "13px", color: "var(--admin-text-light)", marginBottom: "12px" }}>
                        Add room types first before adding physical rooms.
                      </p>
                    )}
                    {roomsLoading ? (
                      <div>Loading…</div>
                    ) : (
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Room #</th>
                              <th>Type</th>
                              <th>Floor</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bizRooms.map((room: any) => (
                              <tr key={room.id}>
                                <td style={{ fontWeight: 600 }}>Room {room.roomNumber}</td>
                                <td>{room.roomType?.name || "—"}</td>
                                <td>{room.floor ?? "—"}</td>
                                <td>
                                  <span className={`badge ${room.status === "available" ? "badge-confirmed" : room.status === "maintenance" ? "badge-pending" : "badge-cancelled"}`}>
                                    {room.status}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <button className="btn btn-outline" style={{ padding: "4px 8px" }} onClick={() => { setIsEditingRoom(true); setRoomForm({ ...room, roomTypeId: String(room.roomTypeId), floor: room.floor ? String(room.floor) : "" }); }}>Edit</button>
                                    <button className="btn btn-outline" style={{ padding: "4px 8px", color: "var(--admin-error)" }} onClick={() => deleteRoom(room.id)}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {bizRooms.length === 0 && (
                              <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-light)" }}>No rooms yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
