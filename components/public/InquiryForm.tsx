"use client";

import { useState } from "react";

interface InquiryFormProps {
  businessId: number;
  businessName: string;
}

export default function InquiryForm({ businessId, businessName }: InquiryFormProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", preferredDate: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() && !form.phone.trim()) {
      alert("Please provide an email address or phone number.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/businesses/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, ...form }),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", phone: "", message: "", preferredDate: "" });
      } else {
        const err = await res.json();
        alert(err.error || "Something went wrong.");
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div style={{
        background: "rgba(26,92,56,0.08)",
        border: "1px solid var(--green)",
        borderRadius: "12px",
        padding: "32px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>✓</div>
        <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "var(--green)" }}>Message sent!</h3>
        <p style={{ color: "var(--text-light)", fontSize: "14px" }}>
          {businessName} will get back to you soon.
        </p>
        <button
          onClick={() => setStatus("idle")}
          style={{ marginTop: "20px", fontSize: "13px", color: "var(--text-light)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="form-group">
        <label>Your name *</label>
        <input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Full name"
          required
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@email.com"
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
          />
        </div>
        <div className="form-group">
          <label>Phone / WhatsApp</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+960 xxx xxxx"
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Preferred date (optional)</label>
        <input
          type="date"
          value={form.preferredDate}
          onChange={(e) => set("preferredDate", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
        />
      </div>

      <div className="form-group">
        <label>Message *</label>
        <textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder={`Ask ${businessName} anything…`}
          required
          rows={4}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "vertical" }}
        />
      </div>

      <button
        type="submit"
        className="btn-luxury"
        disabled={status === "sending"}
        style={{ alignSelf: "flex-start" }}
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
