"use client";

import { useEffect, useMemo, useState } from "react";

type BookingRow = {
  id: number;
  referenceId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  createdAt?: string;
  totalAmount: string;
  status: string;
  adminNotes?: string | null;
  roomType?: { name?: string | null } | null;
  business?: { id: number; name: string } | null;
  testimonials?: ReviewEntry[];
};

type RoomTypeOption = {
  id: number;
  name: string;
};

type RoomOption = {
  id: number;
  roomNumber: string;
  roomTypeId: number;
};

type BusinessOption = {
  id: number;
  name: string;
  businessType: string;
};

type ReviewEntry = {
  id: number;
  guestName: string;
  guestCountry?: string | null;
  rating: number;
  content: string;
  reviewStatus: "pending" | "submitted" | "approved" | "rejected";
  bookingReferenceId?: string;
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<ReviewEntry | null>(null);
  const [savingReview, setSavingReview] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [businessOptions, setBusinessOptions] = useState<BusinessOption[]>([]);
  const [filterPreset, setFilterPreset] = useState<"all" | "month" | "year" | "custom">("month");
  const [filterStartDate, setFilterStartDate] = useState(() => {
    const now = new Date();
    return formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1));
  });
  const [filterEndDate, setFilterEndDate] = useState(() => {
    const now = new Date();
    return formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  });
  const [manualForm, setManualForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestCountry: "",
    businessId: "",
    roomTypeId: "",
    assignedRoomId: "",
    checkIn: "",
    checkOut: "",
    numGuests: "2",
    numRooms: "1",
    totalAmount: "",
    specialRequests: "",
    sendCustomerEmail: false,
  });

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      } else {
        setError(data.error || "Failed to fetch bookings");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchBookings();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const applyFilterPreset = (preset: "all" | "month" | "year" | "custom") => {
    setFilterPreset(preset);
    const now = new Date();
    if (preset === "month") {
      setFilterStartDate(formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1)));
      setFilterEndDate(formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
      return;
    }
    if (preset === "year") {
      setFilterStartDate(formatLocalDate(new Date(now.getFullYear(), 0, 1)));
      setFilterEndDate(formatLocalDate(new Date(now.getFullYear(), 11, 31)));
      return;
    }
    if (preset === "all") {
      setFilterStartDate("");
      setFilterEndDate("");
    }
  };

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [roomTypesRes, roomsRes, bizRes] = await Promise.all([
          fetch("/api/admin/room-types", { cache: "no-store" }),
          fetch("/api/admin/rooms", { cache: "no-store" }),
          fetch("/api/admin/businesses", { cache: "no-store" }),
        ]);
        if (roomTypesRes.ok) setRoomTypes(await roomTypesRes.json());
        if (roomsRes.ok) setRooms(await roomsRes.json());
        if (bizRes.ok) setBusinessOptions(await bizRes.json());
      } catch {
        // Keep booking list functional even if these fail.
      }
    };

    void loadFormData();
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
        const body = await res.json().catch(() => null);
        alert(body?.error || "Update failed");
      }
    } catch {
      alert("An error occurred");
    }
  };

  const submitReviewDecision = async (reviewStatus: "approved" | "rejected") => {
    if (!activeReview) return;
    setSavingReview(true);
    try {
      const isApproved = reviewStatus === "approved";
      const res = await fetch(`/api/admin/testimonials/${activeReview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewStatus,
          isPublished: isApproved,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.error || "Failed to update review");
        return;
      }

      setReviewModalOpen(false);
      setActiveReview(null);
      fetchBookings();
    } catch {
      alert("An error occurred");
    } finally {
      setSavingReview(false);
    }
  };

  const reviewCount = useMemo(
    () => bookings.reduce((acc, b) => acc + (b.testimonials?.length || 0), 0),
    [bookings]
  );
  const filteredBookings = useMemo(() => {
    if (!filterStartDate && !filterEndDate) return bookings;
    return bookings.filter((booking) => {
      const inDate = booking.checkIn;
      const outDate = booking.checkOut;
      if (filterStartDate && outDate < filterStartDate) return false;
      if (filterEndDate && inDate > filterEndDate) return false;
      return true;
    });
  }, [bookings, filterStartDate, filterEndDate]);
  const filteredRooms = useMemo(
    () => rooms.filter((room) => String(room.roomTypeId) === manualForm.roomTypeId),
    [rooms, manualForm.roomTypeId]
  );

  const createManualBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setCreatingBooking(true);

    try {
      const payload = {
        ...manualForm,
        businessId: manualForm.businessId ? Number(manualForm.businessId) : null,
        roomTypeId: manualForm.roomTypeId ? Number(manualForm.roomTypeId) : null,
        assignedRoomId: manualForm.assignedRoomId ? Number(manualForm.assignedRoomId) : null,
        numGuests: Number(manualForm.numGuests) || 1,
        numRooms: Number(manualForm.numRooms) || 1,
      };

      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setCreateError(body?.error || "Failed to create booking");
        return;
      }

      setCreateSuccess(`Manual booking created (${body?.referenceId || "Ref generated"}).`);
      setManualForm({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        guestCountry: "",
        businessId: "",
        roomTypeId: "",
        assignedRoomId: "",
        checkIn: "",
        checkOut: "",
        numGuests: "2",
        numRooms: "1",
        totalAmount: "",
        specialRequests: "",
        sendCustomerEmail: false,
      });
      fetchBookings();
    } catch {
      setCreateError("An error occurred while creating booking.");
    } finally {
      setCreatingBooking(false);
    }
  };

  const exportFilteredBookings = () => {
    const rows = filteredBookings.map((booking) => ({
      referenceId: booking.referenceId,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      roomType: booking.roomType?.name ?? "",
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalAmount: booking.totalAmount,
      status: booking.status,
      bookingType: booking.adminNotes === "Manual booking created by admin" ? "manual" : "website",
      createdAt: booking.createdAt || "",
    }));
    const header = Object.keys(rows[0] || {
      referenceId: "",
      guestName: "",
      guestEmail: "",
      roomType: "",
      checkIn: "",
      checkOut: "",
      totalAmount: "",
      status: "",
      bookingType: "",
      createdAt: "",
    });
    const csvLines = [
      header.join(","),
      ...rows.map((row) =>
        header
          .map((key) => {
            const value = String(row[key as keyof typeof row] ?? "");
            const escaped = value.replace(/"/g, "\"\"");
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ];
    const csv = csvLines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `bookings_${filterStartDate || "all"}_${filterEndDate || "all"}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="card" style={{ color: "var(--admin-error)" }}>{error}</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Bookings</h1>
        <div style={{ fontSize: "13px", color: "var(--admin-text-light)" }}>
          Reviews in system: {reviewCount}
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ fontSize: "13px", color: "var(--admin-text-light)" }}>Filter</label>
          <select
            className="btn btn-outline"
            value={filterPreset}
            onChange={(e) => applyFilterPreset(e.target.value as "all" | "month" | "year" | "custom")}
          >
            <option value="month">Current Month</option>
            <option value="year">Current Year</option>
            <option value="custom">Custom Range</option>
            <option value="all">All Time</option>
          </select>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => {
              setFilterPreset("custom");
              setFilterStartDate(e.target.value);
            }}
          />
          <span style={{ color: "var(--admin-text-light)" }}>to</span>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => {
              setFilterPreset("custom");
              setFilterEndDate(e.target.value);
            }}
          />
          <button className="btn btn-outline" onClick={exportFilteredBookings}>
            Export CSV ({filteredBookings.length})
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: "12px" }}>Create Manual Booking</h2>
        <form onSubmit={createManualBooking}>
          <div className="grid-2">
            <div className="form-group">
              <label>Guest Name</label>
              <input
                required
                value={manualForm.guestName}
                onChange={(e) => setManualForm((prev) => ({ ...prev, guestName: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Guest Email</label>
              <input
                required
                type="email"
                value={manualForm.guestEmail}
                onChange={(e) => setManualForm((prev) => ({ ...prev, guestEmail: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                value={manualForm.guestPhone}
                onChange={(e) => setManualForm((prev) => ({ ...prev, guestPhone: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                value={manualForm.guestCountry}
                onChange={(e) => setManualForm((prev) => ({ ...prev, guestCountry: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Business</label>
              <select
                value={manualForm.businessId}
                onChange={(e) => setManualForm((prev) => ({ ...prev, businessId: e.target.value }))}
              >
                <option value="">No specific business</option>
                {businessOptions.map((biz) => (
                  <option key={biz.id} value={biz.id}>{biz.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Room Type (optional)</label>
              <select
                value={manualForm.roomTypeId}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, roomTypeId: e.target.value, assignedRoomId: "" }))
                }
              >
                <option value="">No room type</option>
                {roomTypes.map((roomType) => (
                  <option key={roomType.id} value={roomType.id}>
                    {roomType.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Assign Room (optional)</label>
              <select
                value={manualForm.assignedRoomId}
                onChange={(e) => setManualForm((prev) => ({ ...prev, assignedRoomId: e.target.value }))}
                disabled={!manualForm.roomTypeId}
              >
                <option value="">Auto-assign available room</option>
                {filteredRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Check-in</label>
              <input
                required
                type="date"
                value={manualForm.checkIn}
                onChange={(e) => setManualForm((prev) => ({ ...prev, checkIn: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Check-out</label>
              <input
                required
                type="date"
                value={manualForm.checkOut}
                onChange={(e) => setManualForm((prev) => ({ ...prev, checkOut: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Guests</label>
              <input
                type="number"
                min={1}
                value={manualForm.numGuests}
                onChange={(e) => setManualForm((prev) => ({ ...prev, numGuests: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Rooms</label>
              <input
                type="number"
                min={1}
                value={manualForm.numRooms}
                onChange={(e) => setManualForm((prev) => ({ ...prev, numRooms: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Total Amount (USD)</label>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={manualForm.totalAmount}
                onChange={(e) => setManualForm((prev) => ({ ...prev, totalAmount: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Special Requests</label>
            <textarea
              rows={2}
              value={manualForm.specialRequests}
              onChange={(e) => setManualForm((prev) => ({ ...prev, specialRequests: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ marginTop: "2px" }}>
            <label
              style={{
                display: "grid",
                gridTemplateColumns: "18px 1fr",
                alignItems: "start",
                gap: "8px",
                cursor: "pointer",
                lineHeight: 1.35,
              }}
            >
              <input
                type="checkbox"
                checked={manualForm.sendCustomerEmail}
                onChange={(e) => setManualForm((prev) => ({ ...prev, sendCustomerEmail: e.target.checked }))}
                style={{ marginTop: "2px" }}
              />
              Send confirmation email now (and review invite will send on checkout)
            </label>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" type="submit" disabled={creatingBooking}>
              {creatingBooking ? "Creating..." : "Create Manual Booking"}
            </button>
            {createError && <span style={{ color: "var(--admin-error)", fontSize: "13px" }}>{createError}</span>}
            {createSuccess && <span style={{ color: "var(--admin-success)", fontSize: "13px" }}>{createSuccess}</span>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>REF ID</th>
                <th>Guest</th>
                <th>Business / Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const review = booking.testimonials?.[0] || null;
                return (
                  <tr key={booking.id}>
                    <td>
                      <div style={{ fontWeight: "600", fontSize: "12px" }}>{booking.referenceId}</div>
                      {booking.adminNotes === "Manual booking created by admin" && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "6px",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: "var(--admin-accent)",
                            background: "rgba(41, 98, 255, 0.1)",
                            border: "1px solid rgba(41, 98, 255, 0.25)",
                            borderRadius: "999px",
                            padding: "2px 8px",
                          }}
                        >
                          Manual
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: "600" }}>{booking.guestName}</div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>{booking.guestEmail}</div>
                    </td>
                    <td>
                      {booking.business?.name && (
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>{booking.business.name}</div>
                      )}
                      {booking.roomType?.name && (
                        <div style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>{booking.roomType.name}</div>
                      )}
                      {!booking.business?.name && !booking.roomType?.name && (
                        <span style={{ color: "var(--admin-text-light)", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                    <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                    <td>${booking.totalAmount}</td>
                    <td>
                      <span className={`badge badge-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                        {booking.status === "checked_out" && review && review.reviewStatus !== "pending" && (
                          <button
                            onClick={() => {
                              setActiveReview({ ...review, bookingReferenceId: booking.referenceId });
                              setReviewModalOpen(true);
                            }}
                            className="btn btn-outline"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            View Review
                          </button>
                        )}
                        {booking.status === "checked_out" && (!review || review.reviewStatus === "pending") && (
                          <span style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>
                            Review not submitted yet
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--admin-text-light)" }}>
                    No bookings found for selected range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewModalOpen && activeReview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setReviewModalOpen(false)}
        >
          <div className="card" style={{ maxWidth: "700px", width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "8px" }}>Guest Review</h2>
            <p style={{ color: "var(--admin-text-light)", fontSize: "13px", marginBottom: "16px" }}>
              Ref: {activeReview.bookingReferenceId || "-"} | Status: {activeReview.reviewStatus || "pending"}
            </p>

            <div style={{ marginBottom: "16px" }}>
              <strong>{activeReview.guestName}</strong>
              {activeReview.guestCountry ? <span style={{ color: "var(--admin-text-light)" }}> | {activeReview.guestCountry}</span> : null}
              <div style={{ marginTop: "8px", color: "#c99700" }}>{"\u2605".repeat(activeReview.rating || 0)}</div>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "14px", marginBottom: "16px", whiteSpace: "pre-wrap" }}>
              {activeReview.content || "Review has not been submitted by the guest yet."}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={() => setReviewModalOpen(false)} disabled={savingReview}>
                Close
              </button>
              <button
                className="btn btn-outline"
                style={{ borderColor: "var(--admin-error)", color: "var(--admin-error)" }}
                onClick={() => submitReviewDecision("rejected")}
                disabled={savingReview || activeReview.reviewStatus === "rejected"}
              >
                {savingReview ? "Saving..." : "Reject"}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => submitReviewDecision("approved")}
                disabled={savingReview || activeReview.reviewStatus === "approved"}
              >
                {savingReview ? "Saving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


