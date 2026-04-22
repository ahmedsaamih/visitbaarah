"use client";

import { useState } from "react";

interface BookingProps {
  roomTypes: any[];
}

export default function BookingSection({ roomTypes }: BookingProps) {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    roomTypeId: "",
    guests: 1,
    rooms: 1
  });

  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState<any[] | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkIn || !formData.checkOut || !formData.roomTypeId) {
      alert("Please fill all fields");
      return;
    }
    
    setLoading(true);
    setAvailable(null);
    try {
      const res = await fetch(`/api/availability/check?roomTypeId=${formData.roomTypeId}&startDate=${formData.checkIn}&endDate=${formData.checkOut}`);
      if (res.ok) {
        const data = await res.json();
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
                    style={{ background: "#fff" }}
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
                  />
                </div>
                <div className="form-group">
                  <label>Check-out</label>
                  <input 
                    type="date" 
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    value={formData.checkOut} 
                    onChange={e => setFormData({ ...formData, checkOut: e.target.value })} 
                    required 
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

                {!available.booked ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
                    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
                    
                    try {
                      const res = await fetch("/api/bookings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ...formData,
                          guestName: name,
                          guestEmail: email,
                          totalAmount: (parseFloat(roomTypes.find(rt => rt.id == formData.roomTypeId)?.basePrice || "0") * 
                            Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))).toString()
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
                    <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>Booking Confirmed!</div>
                    <p style={{ fontSize: "14px", marginBottom: "16px" }}>Your reference is <strong>{available.ref}</strong>. Check your email for details.</p>
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
          </div>
        </div>
      </div>
    </section>
  );
}
