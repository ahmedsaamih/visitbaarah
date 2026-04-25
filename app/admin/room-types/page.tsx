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
    seasonalRates: [],
    maldivianDiscountPercent: "0",
  });
  const seasonalRates: any[] = Array.isArray(formData.seasonalRates) ? formData.seasonalRates : [];
  const overlapMessages = getSeasonalRateOverlapMessages(seasonalRates);

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
        setFormData({ name: "", slug: "", description: "", basePrice: "", maxGuests: 2, bedType: "", size: "", amenities: [], seasonalRates: [], maldivianDiscountPercent: "0" });
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
        <button onClick={() => { setIsEditing(true); setFormData({ name: "", slug: "", description: "", basePrice: "", maxGuests: 2, bedType: "", size: "", amenities: [], seasonalRates: [], maldivianDiscountPercent: "0" }); }} className="btn btn-primary">
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

            <div className="form-group">
              <label>Seasonal / Date-Range Rates (Optional)</label>
              <div style={{ marginBottom: "10px", maxWidth: "320px" }}>
                <label style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>
                  Maldivian Discount (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={formData.maldivianDiscountPercent ?? "0"}
                  onChange={(e) => setFormData({ ...formData, maldivianDiscountPercent: e.target.value })}
                />
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                {seasonalRates.map((rate: any, index: number) => (
                  <div
                    key={`${rate.startDate || "rate"}-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "90px minmax(140px,1fr) minmax(140px,1fr) minmax(140px,1fr) minmax(160px,1fr) auto auto auto",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "var(--admin-text-light)", fontWeight: 600 }}>
                      Priority {index + 1}
                    </div>
                    <input
                      type="date"
                      value={rate.startDate || ""}
                      onChange={(e) => {
                        const next = [...(formData.seasonalRates || [])];
                        next[index] = { ...next[index], startDate: e.target.value };
                        setFormData({ ...formData, seasonalRates: next });
                      }}
                    />
                    <input
                      type="date"
                      value={rate.endDate || ""}
                      onChange={(e) => {
                        const next = [...(formData.seasonalRates || [])];
                        next[index] = { ...next[index], endDate: e.target.value };
                        setFormData({ ...formData, seasonalRates: next });
                      }}
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Nightly rate"
                      value={rate.nightlyRate || ""}
                      onChange={(e) => {
                        const next = [...(formData.seasonalRates || [])];
                        next[index] = { ...next[index], nightlyRate: e.target.value };
                        setFormData({ ...formData, seasonalRates: next });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Label (optional)"
                      value={rate.label || ""}
                      onChange={(e) => {
                        const next = [...seasonalRates];
                        next[index] = { ...next[index], label: e.target.value };
                        setFormData({ ...formData, seasonalRates: next });
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={index === 0}
                      onClick={() => {
                        if (index === 0) return;
                        const next = [...seasonalRates];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        setFormData({ ...formData, seasonalRates: next });
                      }}
                      title="Move up priority"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={index === seasonalRates.length - 1}
                      onClick={() => {
                        if (index === seasonalRates.length - 1) return;
                        const next = [...seasonalRates];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        setFormData({ ...formData, seasonalRates: next });
                      }}
                      title="Move down priority"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ color: "var(--admin-error)" }}
                      onClick={() => {
                        const next = [...seasonalRates];
                        next.splice(index, 1);
                        setFormData({ ...formData, seasonalRates: next });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              {overlapMessages.length > 0 && (
                <div
                  style={{
                    marginTop: "10px",
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "12px",
                    color: "#9a3412",
                  }}
                >
                  <strong>Overlap warning:</strong>
                  <div style={{ marginTop: "6px", display: "grid", gap: "4px" }}>
                    {overlapMessages.map((msg, idx) => (
                      <div key={`overlap-${idx}`}>- {msg}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: "6px" }}>
                    First matching range by priority is used for each night.
                  </div>
                </div>
              )}
              <div style={{ marginTop: "10px" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        seasonalRates: [...seasonalRates, { startDate: "", endDate: "", nightlyRate: "", label: "" }],
                      })
                    }
                  >
                    Add Date-Range Price
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Seasonal Rates
                  </button>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "var(--admin-text-light)", marginTop: "8px" }}>
                The first matching date range by priority is applied for each stay night. Base price is used when no range matches.
              </p>
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
                <th>Date-range prices</th>
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
                  <td>{item.seasonalRates?.length || 0}</td>
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

function getSeasonalRateOverlapMessages(rates: Array<{ startDate?: string; endDate?: string; label?: string }>) {
  const messages: string[] = [];
  for (let i = 0; i < rates.length; i++) {
    const a = rates[i];
    if (!a?.startDate || !a?.endDate) continue;
    if (a.startDate > a.endDate) {
      messages.push(`Priority ${i + 1} has start date after end date.`);
      continue;
    }
    for (let j = i + 1; j < rates.length; j++) {
      const b = rates[j];
      if (!b?.startDate || !b?.endDate) continue;
      if (b.startDate > b.endDate) continue;
      const overlaps = a.startDate <= b.endDate && b.startDate <= a.endDate;
      if (!overlaps) continue;
      const left = a.label?.trim() ? `${a.label} (P${i + 1})` : `Priority ${i + 1}`;
      const right = b.label?.trim() ? `${b.label} (P${j + 1})` : `Priority ${j + 1}`;
      messages.push(`${left} overlaps with ${right}.`);
    }
  }
  return messages;
}
