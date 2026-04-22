"use client";

import { useEffect, useState } from "react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      } else {
        setError(data.error || "Failed to fetch bookings");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchBookings();
      } else {
        alert("Update failed");
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="card" style={{ color: "var(--admin-error)" }}>{error}</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Bookings</h1>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>REF ID</th>
                <th>Guest</th>
                <th>Room Type</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td style={{ fontWeight: "600", fontSize: "12px" }}>{booking.referenceId}</td>
                  <td>
                    <div style={{ fontWeight: "600" }}>{booking.guestName}</div>
                    <div style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>{booking.guestEmail}</div>
                  </td>
                  <td>{booking.roomType?.name ?? "Deleted room type"}</td>
                  <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                  <td>${booking.totalAmount}</td>
                  <td>
                    <span className={`badge badge-${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {booking.status === "pending" && (
                        <>
                          <button 
                            onClick={() => updateStatus(booking.id, "confirmed")}
                            className="btn btn-outline" 
                            style={{ padding: "4px 8px", fontSize: "12px", borderColor: "var(--admin-success)", color: "var(--admin-success)" }}
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => updateStatus(booking.id, "rejected")}
                            className="btn btn-outline" 
                            style={{ padding: "4px 8px", fontSize: "12px", borderColor: "var(--admin-error)", color: "var(--admin-error)" }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <button 
                          onClick={() => updateStatus(booking.id, "checked_in")}
                          className="btn btn-outline" 
                          style={{ padding: "4px 8px", fontSize: "12px", borderColor: "var(--admin-accent)", color: "var(--admin-accent)" }}
                        >
                          Check In
                        </button>
                      )}
                      {booking.status === "checked_in" && (
                        <button 
                          onClick={() => updateStatus(booking.id, "checked_out")}
                          className="btn btn-outline" 
                          style={{ padding: "4px 8px", fontSize: "12px", borderColor: "var(--admin-accent)", color: "var(--admin-accent)" }}
                        >
                          Check Out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--admin-text-light)" }}>
                    No bookings found.
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
