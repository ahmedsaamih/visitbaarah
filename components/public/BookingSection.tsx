"use client";

import { useState } from "react";

interface BookingProps {
  roomTypes: any[];
}

type AvailabilityResult = {
  available: boolean;
  availableCount?: number;
  pricing?: {
    nights: number;
    roomTotal: string;
    minNightlyRate: string;
    maxNightlyRate: string;
    averageNightlyRate: string;
    discountPercentApplied: string;
    discountAmount: string;
  };
  booked?: boolean;
  ref?: string;
};

export default function BookingSection({ roomTypes }: BookingProps) {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    roomTypeId: "",
    nationality: "Foreigner",
    guests: 1,
    rooms: 1
  });

  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState<AvailabilityResult | null>(null);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupRef, setLookupRef] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupBooking, setLookupBooking] = useState<any | null>(null);

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "12px",
    border: "1px solid #d8e2ea",
    background: "#fff",
    padding: "12px 14px",
    fontSize: "14px",
    color: "#2c3e50",
    boxShadow: "0 1px 2px rgba(13, 92, 92, 0.04)",
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkIn || !formData.checkOut || !formData.roomTypeId) {
      alert("Please fill all fields");
      return;
    }
    
    setLoading(true);
    setAvailable(null);
    try {
      const res = await fetch(`/api/availability/check?roomTypeId=${formData.roomTypeId}&startDate=${formData.checkIn}&endDate=${formData.checkOut}&nationality=${encodeURIComponent(formData.nationality)}`);
      if (res.ok) {
        const data = (await res.json()) as AvailabilityResult;
        setAvailable(data);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to check availability");
        setAvailable(null);
      }
    } catch (err) {
      alert("Error checking availability. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    setLookupBooking(null);
    if (!lookupRef.trim() || !lookupEmail.trim()) {
      setLookupError("Reference ID and email are required.");
      return;
    }
    setLookupLoading(true);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(lookupRef.trim())}?email=${encodeURIComponent(lookupEmail.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || "Booking not found.");
      } else {
        setLookupBooking(data);
      }
    } catch {
      setLookupError("Failed to retrieve booking. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <section id="booking" className="section" style={{ background: "var(--teal)", color: "#fff" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "60px", alignItems: "center" }}>
          <div className="reveal">
            <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>RESERVATIONS</h4>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#fff", marginBottom: "24px" }}>Start Your Journey</h2>
            <p style={{ opacity: 0.8, marginBottom: "32px", fontSize: "15px" }}>
              Ready to experience paradise? Check availability and book your stay with us today. 
              Best rate guaranteed when you book direct.
            </p>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "24px", borderRadius: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>Why book with us?</div>
              <ul style={{ fontSize: "14px", opacity: 0.8, listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "10px" }}>✓ Instant Confirmation</li>
                <li style={{ marginBottom: "10px" }}>✓ No Hidden Fees</li>
                <li>✓ Flexible Cancellation</li>
              </ul>
            </div>
          </div>

          <div className="reveal card-island" style={{ padding: "clamp(24px, 5vw, 40px)", color: "var(--text)" }}>
            <h3 style={{ marginBottom: "24px", fontSize: "24px" }}>Check Availability</h3>
            <form onSubmit={handleCheck}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                   <label>Accommodation</label>
                   <select 
                    value={formData.roomTypeId} 
                    onChange={e => setFormData({ ...formData, roomTypeId: e.target.value })} 
                    required 
                    style={{ ...fieldStyle, appearance: "none", backgroundImage: "linear-gradient(45deg, transparent 50%, #0d5c5c 50%), linear-gradient(135deg, #0d5c5c 50%, transparent 50%)", backgroundPosition: "calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px)", backgroundSize: "6px 6px, 6px 6px", backgroundRepeat: "no-repeat" }}
                   >
                     <option value="">Select a Room Type</option>
                     {roomTypes.map(rt => (
                       <option key={rt.id} value={rt.id}>{rt.name}</option>
                     ))}
                   </select>
                </div>
                <div className="form-group">
                  <label>Check-in</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.checkIn} 
                    onChange={e => setFormData({ ...formData, checkIn: e.target.value })} 
                    required
                    style={fieldStyle}
                  />
                </div>
                <div className="form-group">
                  <label>Nationality</label>
                  <select
                    value={formData.nationality}
                    onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                    required
                    style={{ ...fieldStyle, appearance: "none", backgroundImage: "linear-gradient(45deg, transparent 50%, #0d5c5c 50%), linear-gradient(135deg, #0d5c5c 50%, transparent 50%)", backgroundPosition: "calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px)", backgroundSize: "6px 6px, 6px 6px", backgroundRepeat: "no-repeat" }}
                  >
                    <option value="Foreigner">Foreigner</option>
                    <option value="Maldivian">Maldivian</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Check-out</label>
                  <input 
                    type="date" 
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    value={formData.checkOut} 
                    onChange={e => setFormData({ ...formData, checkOut: e.target.value })} 
                    required
                    style={fieldStyle}
                  />
                </div>
              </div>
              <button type="submit" className="btn-luxury" style={{ width: "100%" }} disabled={loading}>
                {loading ? "Checking..." : "Check Availability"}
              </button>
            </form>

            {available?.available && (
              <div style={{ marginTop: "24px", padding: "clamp(20px, 4vw, 32px)", background: "#f0fdf4", border: "1px solid #bcf0da", borderRadius: "12px", color: "#065f46" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
                   <span style={{ fontSize: "24px" }}>✨</span>
                   <div>
                     <strong>Room Available!</strong>
                     <p style={{ fontSize: "14px", opacity: 0.9 }}>Secure your stay by entering your details below.</p>
                   </div>
                </div>
                {available.pricing && (
                  <div
                    style={{
                      background: "#ecfdf3",
                      border: "1px solid #bcf0da",
                      borderRadius: "10px",
                      padding: "12px",
                      marginBottom: "16px",
                      fontSize: "13px",
                    }}
                  >
                    <div>
                      <strong>Rate per night:</strong> ${available.pricing.minNightlyRate}
                      {available.pricing.minNightlyRate !== available.pricing.maxNightlyRate
                        ? ` - $${available.pricing.maxNightlyRate}`
                        : ""}
                    </div>
                    <div><strong>Nights:</strong> {available.pricing.nights}</div>
                    {Number(available.pricing.discountPercentApplied) > 0 && (
                      <div>
                        <strong>Maldivian discount:</strong> {available.pricing.discountPercentApplied}% (-$
                        {available.pricing.discountAmount})
                      </div>
                    )}
                    <div><strong>Room total:</strong> ${available.pricing.roomTotal}</div>
                  </div>
                )}

                {!available.booked ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
                    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
                    
                    try {
                      const calculatedTotal = available?.pricing?.roomTotal || "0";

                      const res = await fetch("/api/bookings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ...formData,
                          guestName: name,
                          guestEmail: email,
                          guestCountry: formData.nationality,
                          nationality: formData.nationality,
                          totalAmount: calculatedTotal,
                          roomTotal: calculatedTotal
                        })
                      });
                      if (res.ok) {
                        const resData = await res.json();
                        setAvailable({ ...available, booked: true, ref: resData.referenceId });
                      } else {
                        alert("Booking failed. Please try again.");
                      }
                    } catch (err) {
                      alert("Network error.");
                    } finally {
                      setLoading(false);
                    }
                  }}>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "13px", color: "#065f46", marginBottom: "4px", display: "block" }}>Full Name</label>
                      <input name="name" required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #bcf0da" }} />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ fontSize: "13px", color: "#065f46", marginBottom: "4px", display: "block" }}>Email Address</label>
                      <input name="email" type="email" required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #bcf0da" }} />
                    </div>
                    <button type="submit" className="btn-luxury" style={{ width: "100%" }} disabled={loading}>
                      {loading ? "Confirming..." : "Confirm My Booking"}
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>Booking Request Received!</div>
                    <p style={{ fontSize: "14px", marginBottom: "16px" }}>
                      Your reference is <strong>{available.ref}</strong>. This request is pending admin confirmation, and you can track it anytime.
                    </p>
                    <button onClick={() => setAvailable(null)} className="btn-outline-gold" style={{ width: "100%" }}>Done</button>
                  </div>
                )}
              </div>
            )}
            
            {available && !available.available && (
              <div style={{ marginTop: "24px", padding: "20px", background: "#fdf2f2", border: "1px solid #fbd5d5", borderRadius: "8px", color: "#9b1c1c" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                   <span style={{ fontSize: "24px" }}>📅</span>
                   <div>
                     <strong>Fully Booked</strong>
                     <p style={{ fontSize: "13px", opacity: 0.8 }}>No rooms available for these dates. Try another room type or different dates.</p>
                   </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: "18px" }}>
              <button
                type="button"
                className="btn-outline-gold"
                style={{ width: "100%", textAlign: "center" }}
                onClick={() => {
                  setLookupOpen(true);
                  setLookupError("");
                  setLookupBooking(null);
                }}
              >
                View My Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {lookupOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(4, 18, 31, 0.56)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1400,
            padding: "16px",
          }}
          onClick={() => setLookupOpen(false)}
        >
          <div
            className="card-island"
            style={{
              width: "100%",
              maxWidth: "620px",
              maxHeight: "88vh",
              overflowY: "auto",
              padding: "clamp(20px, 4vw, 34px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "26px", color: "var(--teal)" }}>View My Booking</h3>
              <button type="button" onClick={() => setLookupOpen(false)} style={{ border: "none", background: "transparent", fontSize: "24px", cursor: "pointer", color: "var(--text-light)" }}>×</button>
            </div>
            <p style={{ color: "var(--text-light)", marginBottom: "16px", fontSize: "14px" }}>
              Enter your reference ID and booking email.
            </p>

            <form onSubmit={handleLookup}>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label>Reference ID</label>
                <input
                  value={lookupRef}
                  onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                  placeholder="e.g. GH832FM7"
                  style={fieldStyle}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Email Address</label>
                <input
                  type="email"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={fieldStyle}
                  required
                />
              </div>
              <button type="submit" className="btn-luxury" style={{ width: "100%" }} disabled={lookupLoading}>
                {lookupLoading ? "Retrieving..." : "Retrieve Booking"}
              </button>
            </form>

            {lookupError && <p style={{ color: "#9b1c1c", marginTop: "12px", fontSize: "14px" }}>{lookupError}</p>}

            {lookupBooking && (
              <div style={{ marginTop: "18px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
                  <div><strong>Status:</strong> {lookupBooking.status?.toUpperCase().replace("_", " ")}</div>
                  <div><strong>Reference:</strong> {lookupBooking.referenceId}</div>
                  <div><strong>Guest:</strong> {lookupBooking.guestName}</div>
                  <div><strong>Room:</strong> {lookupBooking.roomType?.name ?? "Room"}</div>
                  <div><strong>Check-in:</strong> {new Date(lookupBooking.checkIn).toLocaleDateString()}</div>
                  <div><strong>Check-out:</strong> {new Date(lookupBooking.checkOut).toLocaleDateString()}</div>
                </div>
                <a
                  href={`/booking/${lookupBooking.referenceId}`}
                  className="btn-outline-gold"
                  style={{ width: "100%", textAlign: "center", marginTop: "14px" }}
                >
                  Open Full Booking Page
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
