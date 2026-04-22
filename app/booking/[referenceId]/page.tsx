"use client";

import Navbar from "@/components/public/Navbar";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function BookingLookupPage() {
  const params = useParams<{ referenceId: string }>();
  const referenceId = params.referenceId;
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [editValues, setEditValues] = useState({
    checkIn: "",
    checkOut: "",
    numGuests: 1,
    numRooms: 1,
    specialRequests: "",
  });
  const [editOpen, setEditOpen] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${referenceId}?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Booking not found");
        setBooking(null);
        return;
      }
      setBooking(data);
      setEditValues({
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        numGuests: data.numGuests ?? 1,
        numRooms: data.numRooms ?? 1,
        specialRequests: data.specialRequests ?? "",
      });
    } catch {
      setError("Failed to fetch booking");
    } finally {
      setLoading(false);
    }
  };

  const requestCancellation = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${referenceId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), reason: cancelReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Cancellation request failed");
      } else {
        alert("Cancellation request submitted.");
        setCancelReason("");
        fetchBooking();
      }
    } catch {
      alert("Cancellation request failed");
    } finally {
      setLoading(false);
    }
  };

  const submitEdit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${referenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          checkIn: editValues.checkIn,
          checkOut: editValues.checkOut,
          numGuests: Number(editValues.numGuests),
          numRooms: Number(editValues.numRooms),
          specialRequests: editValues.specialRequests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to edit booking");
      } else {
        alert("Booking updated. It is now pending admin approval.");
        setEditOpen(false);
        fetchBooking();
      }
    } catch {
      alert("Failed to edit booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <Navbar />
      <div className="container" style={{ paddingTop: "150px", paddingBottom: "100px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="reveal card-island" style={{ padding: "30px", marginBottom: "24px" }}>
            <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "12px" }}>BOOKING LOOKUP</h4>
            <p style={{ color: "var(--text-light)", marginBottom: "16px" }}>
              Enter the email used for booking reference <strong>{referenceId}</strong>.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ flex: 1, minWidth: "240px", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
              <button className="btn-luxury" onClick={fetchBooking} disabled={loading}>
                {loading ? "Loading..." : "Retrieve Booking"}
              </button>
            </div>
            {error && <p style={{ color: "#9b1c1c", marginTop: "10px" }}>{error}</p>}
          </div>

          {booking && (
            <>
              <div className="reveal" style={{ marginBottom: "24px" }}>
                <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>BOOKING DETAILS</h4>
                <h1 style={{ fontSize: "42px" }}>
                  Status: <span className={`text-${booking.status}`}>{booking.status.toUpperCase().replace("_", " ")}</span>
                </h1>
              </div>

              <div className="card-island reveal" style={{ padding: "40px", marginBottom: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-light)", textTransform: "uppercase" }}>Reference ID</label>
                    <div style={{ fontWeight: "700", fontSize: "20px", color: "var(--teal)" }}>{booking.referenceId}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-light)", textTransform: "uppercase" }}>Guest Name</label>
                    <div style={{ fontWeight: "600" }}>{booking.guestName}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-light)", textTransform: "uppercase" }}>Dates</label>
                    <div style={{ fontWeight: "600" }}>
                      {new Date(booking.checkIn).toLocaleDateString()} &rarr; {new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-light)", textTransform: "uppercase" }}>Accommodation</label>
                    <div style={{ fontWeight: "600" }}>{booking.roomType?.name ?? "Deleted room type"}</div>
                  </div>
                </div>

                <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px" }}>
                    <span>Total Amount</span>
                    <span style={{ fontWeight: "800", color: "var(--teal)" }}>${booking.totalAmount}</span>
                  </div>
                </div>
              </div>

              {booking.status !== "cancelled" && booking.status !== "rejected" && booking.status !== "checked_out" && (
                <div className="reveal card-island" style={{ padding: "30px", marginBottom: "24px" }}>
                  <h3 style={{ marginBottom: "12px" }}>Edit Booking</h3>
                  <p style={{ color: "var(--text-light)", marginBottom: "16px", fontSize: "14px" }}>
                    If you edit this booking, it will return to <strong>pending</strong> and require admin confirmation.
                  </p>
                  {!editOpen ? (
                    <button className="btn-outline-gold" onClick={() => setEditOpen(true)}>Edit Booking</button>
                  ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <input type="date" value={editValues.checkIn} onChange={(e) => setEditValues({ ...editValues, checkIn: e.target.value })} />
                        <input type="date" value={editValues.checkOut} onChange={(e) => setEditValues({ ...editValues, checkOut: e.target.value })} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <input type="number" min={1} value={editValues.numGuests} onChange={(e) => setEditValues({ ...editValues, numGuests: Number(e.target.value) })} placeholder="Guests" />
                        <input type="number" min={1} value={editValues.numRooms} onChange={(e) => setEditValues({ ...editValues, numRooms: Number(e.target.value) })} placeholder="Rooms" />
                      </div>
                      <textarea
                        rows={3}
                        value={editValues.specialRequests}
                        onChange={(e) => setEditValues({ ...editValues, specialRequests: e.target.value })}
                        placeholder="Special requests"
                      />
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button className="btn-luxury" onClick={submitEdit} disabled={loading}>Save Changes</button>
                        <button className="btn-outline-gold" onClick={() => setEditOpen(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {booking.status !== "cancelled" && booking.status !== "rejected" && (
                <div className="reveal card-island" style={{ padding: "30px" }}>
                  <h3 style={{ marginBottom: "12px" }}>Request Cancellation</h3>
                  <textarea
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation"
                    style={{ width: "100%", marginBottom: "12px" }}
                  />
                  <button
                    className="btn-outline-gold"
                    style={{ color: "#9b1c1c", borderColor: "#9b1c1c" }}
                    onClick={requestCancellation}
                    disabled={loading}
                  >
                    Submit Cancellation Request
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
