"use client";

import { useEffect, useState } from "react";

export default function AdminRooms() {
  const [items, setItems] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    roomNumber: "",
    roomTypeId: "",
    floor: "",
    status: "available",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const [roomsRes, typesRes] = await Promise.all([
        fetch("/api/admin/rooms"),
        fetch("/api/admin/room-types")
      ]);
      const roomsData = await roomsRes.ok ? await roomsRes.json() : [];
      const typesData = await typesRes.ok ? await typesRes.json() : [];
      setItems(roomsData);
      setRoomTypes(typesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id ? `/api/admin/rooms/${formData.id}` : "/api/admin/rooms";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          roomTypeId: parseInt(formData.roomTypeId),
          floor: formData.floor ? parseInt(formData.floor) : null
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        setFormData({ roomNumber: "", roomTypeId: "", floor: "", status: "available", notes: "" });
        fetchData();
      }
    } catch (err) {
      alert("Submission failed");
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Rooms</h1>
        <button onClick={() => { setIsEditing(true); setFormData({ roomNumber: "", roomTypeId: roomTypes[0]?.id || "", floor: "", status: "available", notes: "" }); }} className="btn btn-primary">
          Add Room
        </button>
      </div>

      {isEditing && (
        <div className="card">
          <h2>{formData.id ? "Edit" : "Add"} Room</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Room Number</label>
                <input value={formData.roomNumber} onChange={e => setFormData({ ...formData, roomNumber: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Room Type</label>
                <select value={formData.roomTypeId} onChange={e => setFormData({ ...formData, roomTypeId: e.target.value })} required>
                  <option value="">Select Type</option>
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Floor</label>
                <input type="number" value={formData.floor} onChange={e => setFormData({ ...formData, floor: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} required>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} />
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
                <th>Room #</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: "600" }}>{item.roomNumber}</td>
                  <td>{item.roomType?.name}</td>
                  <td>{item.floor || "-"}</td>
                  <td>
                    <span className={`badge badge-${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => { setIsEditing(true); setFormData({ ...item, roomTypeId: item.roomTypeId.toString() }); }} className="btn btn-outline" style={{ padding: "4px 8px" }}>Edit</button>
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
