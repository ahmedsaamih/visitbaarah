"use client";

import { useEffect, useMemo, useState } from "react";

type BookingRow = {
  id: number;
  referenceId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalAmount: string;
  status: string;
  roomType?: { name?: string | null } | null;
  testimonials?: ReviewEntry[];
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
              {bookings.map((booking) => {
                const review = booking.testimonials?.[0] || null;
                return (
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


