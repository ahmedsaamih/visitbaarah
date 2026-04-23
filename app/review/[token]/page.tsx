"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ReviewData = {
  guestName: string;
  guestCountry: string;
  checkIn?: string;
  checkOut?: string;
  referenceId?: string;
  expiresAt?: string;
};

export default function ReviewPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || "";
  const [data, setData] = useState<ReviewData | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [guestCountry, setGuestCountry] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/reviews/${token}`);
        const body = await res.json();
        if (!res.ok) {
          setError(body.error || "Review link is invalid or expired.");
          return;
        }
        setData(body);
        setGuestCountry(body.guestCountry || "");
      } catch {
        setError("Unable to load review form.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/reviews/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content, guestCountry }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error || "Could not submit review.");
        return;
      }
      setSuccess("Thank you! Your review was submitted and is waiting for approval.");
      setContent("");
    } catch {
      setError("Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(201,169,110,0.16), transparent 38%), var(--cream)",
        padding: "40px 16px",
      }}
    >
      <div className="container" style={{ maxWidth: "760px" }}>
        <div className="card-island" style={{ padding: "clamp(20px, 4vw, 38px)", border: "1px solid rgba(13,92,92,0.12)" }}>
          <div style={{ marginBottom: "18px" }}>
            <div style={{ color: "var(--gold)", letterSpacing: "2px", fontSize: "12px", marginBottom: "8px" }}>
              SERENE SEAVIEW
            </div>
            <h1 style={{ marginBottom: "10px", fontSize: "clamp(28px, 5vw, 40px)" }}>Share Your Stay Experience</h1>
          </div>
          <p style={{ color: "var(--text-light)", marginBottom: "24px", lineHeight: 1.65 }}>
            Your feedback helps us improve and helps future guests choose us with confidence.
          </p>

          {loading && <p>Loading review form...</p>}
          {!loading && error && <p style={{ color: "#b42318" }}>{error}</p>}
          {!loading && success && <p style={{ color: "#067647" }}>{success}</p>}

          {!loading && data && !success && (
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "22px",
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "14px",
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: "6px", color: "var(--text-light)", fontSize: "12px", letterSpacing: "0.8px" }}>GUEST</label>
                  <input value={data.guestName} disabled />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", color: "var(--text-light)", fontSize: "12px", letterSpacing: "0.8px" }}>REFERENCE</label>
                  <input value={data.referenceId || "-"} disabled />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", color: "var(--text-light)", fontSize: "12px", letterSpacing: "0.8px" }}>CHECK-IN</label>
                  <input value={data.checkIn || "-"} disabled />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", color: "var(--text-light)", fontSize: "12px", letterSpacing: "0.8px" }}>CHECK-OUT</label>
                  <input value={data.checkOut || "-"} disabled />
                </div>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  value={guestCountry}
                  onChange={(e) => setGuestCountry(e.target.value)}
                  placeholder="Country"
                />
              </div>

              <div className="form-group">
                <label>Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div style={{ marginTop: "-4px", marginBottom: "14px", color: "var(--gold)", fontSize: "20px", letterSpacing: "2px" }}>
                {"\u2605".repeat(rating)}{"\u2606".repeat(5 - rating)}
              </div>

              <div className="form-group">
                <label>Your review</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  required
                  placeholder="Tell us what you enjoyed and what we can improve."
                />
              </div>

              <p style={{ fontSize: "13px", color: "var(--text-light)", marginBottom: "16px" }}>
                This link expires on {data.expiresAt ? new Date(data.expiresAt).toLocaleString() : "soon"}.
              </p>

              <button type="submit" className="btn-luxury" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
