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
    load();
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
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "40px 16px" }}>
      <div className="container" style={{ maxWidth: "760px" }}>
        <div className="card-island" style={{ padding: "32px" }}>
          <h1 style={{ marginBottom: "12px" }}>Share Your Stay Experience</h1>
          <p style={{ color: "var(--text-light)", marginBottom: "24px" }}>
            Your feedback helps us improve and helps future guests choose us with confidence.
          </p>

          {loading && <p>Loading review form...</p>}
          {!loading && error && <p style={{ color: "#b42318" }}>{error}</p>}
          {!loading && success && <p style={{ color: "#067647" }}>{success}</p>}

          {!loading && data && !success && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px" }}>Guest</label>
                  <input value={data.guestName} disabled />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px" }}>Reference</label>
                  <input value={data.referenceId || "-"} disabled />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px" }}>Check-in</label>
                  <input value={data.checkIn || "-"} disabled />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px" }}>Check-out</label>
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
