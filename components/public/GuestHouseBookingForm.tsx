"use client";

import { useState } from "react";

interface Props {
  businessId: number;
  businessName: string;
}

export default function GuestHouseBookingForm({ businessId, businessName }: Props) {
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestCountry: "",
    checkIn: "",
    checkOut: "",
    numGuests: "2",
    specialRequests: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestEmail.trim() && !form.guestPhone.trim()) {
      alert("Please provide an email address or phone number.");
      return;
    }
    if (form.checkIn && form.checkOut && form.checkIn >= form.checkOut) {
      alert("Check-out date must be after check-in.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          guestName: form.guestName,
          guestEmail: form.guestEmail,
          guestPhone: form.guestPhone,
          guestCountry: form.guestCountry,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          numGuests: parseInt(form.numGuests) || 2,
          numRooms: 1,
          specialRequests: form.specialRequests,
        }),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ guestName: "", guestEmail: "", guestPhone: "", guestCountry: "", checkIn: "", checkOut: "", numGuests: "2", specialRequests: "" });
      } else {
        const err = await res.json().catch(() => ({}));
        alert((err as { error?: string }).error || "Something went wrong. Please try again.");
        setStatus("idle");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div style={{
        background: "rgba(26,92,56,0.07)",
        border: "1px solid var(--green)",
        borderRadius: "12px",
        padding: "36px 28px",
        textAlign: "center",
      }}>
        <div style={{
          width: "48px", height: "48px",
          borderRadius: "50%",
          background: "var(--green)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          color: "#fff", fontSize: "22px",
        }}>✓</div>
        <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "var(--green)" }}>
          Booking request sent!
        </h3>
        <p style={{ color: "var(--text-light)", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>
          {businessName} will confirm your booking shortly. Check your email for a reference number.
        </p>
        <button
          onClick={() => setStatus("idle")}
          style={{ fontSize: "13px", color: "var(--text-light)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
        >
          Submit another request
        </button>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid var(--border)",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "#fff",
    color: "var(--text)",
    outline: "none",
    transition: "border-color 180ms ease",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="form-group">
        <label>Full name *</label>
        <input
          value={form.guestName}
          onChange={(e) => set("guestName", e.target.value)}
          placeholder="Your full name"
          required
          style={inputStyle}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={form.guestEmail}
            onChange={(e) => set("guestEmail", e.target.value)}
            placeholder="you@email.com"
            style={inputStyle}
          />
        </div>
        <div className="form-group">
          <label>Phone / WhatsApp</label>
          <input
            type="tel"
            value={form.guestPhone}
            onChange={(e) => set("guestPhone", e.target.value)}
            placeholder="+960 xxx xxxx"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="form-group">
          <label>Check-in *</label>
          <input
            type="date"
            value={form.checkIn}
            min={today}
            onChange={(e) => set("checkIn", e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div className="form-group">
          <label>Check-out *</label>
          <input
            type="date"
            value={form.checkOut}
            min={form.checkIn || today}
            onChange={(e) => set("checkOut", e.target.value)}
            required
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="form-group">
          <label>Guests</label>
          <select
            value={form.numGuests}
            onChange={(e) => set("numGuests", e.target.value)}
            style={inputStyle}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Country</label>
          <input
            value={form.guestCountry}
            onChange={(e) => set("guestCountry", e.target.value)}
            placeholder="e.g. United Kingdom"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Special requests</label>
        <textarea
          value={form.specialRequests}
          onChange={(e) => set("specialRequests", e.target.value)}
          placeholder="Dietary requirements, arrival time, room preferences…"
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{
        background: "rgba(200,120,32,0.06)",
        border: "1px solid rgba(200,120,32,0.2)",
        borderRadius: "8px",
        padding: "12px 14px",
        fontSize: "12px",
        color: "var(--text-light)",
        lineHeight: 1.6,
      }}>
        Your booking request will be reviewed by {businessName}. Pricing and availability will be confirmed directly with you.
      </div>

      <button
        type="submit"
        className="btn-luxury"
        disabled={status === "sending"}
        style={{ alignSelf: "flex-start" }}
      >
        {status === "sending" ? "Sending…" : "Request Booking"}
      </button>
    </form>
  );
}
