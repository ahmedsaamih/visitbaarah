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
    try {
      const res = await fetch(`/api/availability/check?roomTypeId=${formData.roomTypeId}&startDate=${formData.checkIn}&endDate=${formData.checkOut}`);
      const data = await res.ok ? await res.json() : [];
      setAvailable(data);
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

            {available && available.length > 0 && (
              <div style={{ marginTop: "24px", padding: "20px", background: "#f0fdf4", border: "1px solid #bcf0da", borderRadius: "8px", color: "#065f46" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                   <span style={{ fontSize: "24px" }}>✨</span>
                   <div>
                     <strong>Great news!</strong>
                     <p style={{ fontSize: "13px", opacity: 0.8 }}>This room is available for your selected dates.</p>
                   </div>
                </div>
                <button className="btn-luxury" style={{ width: "100%", marginTop: "16px" }}>Complete Booking</button>
              </div>
            )}
            {available && available.length === 0 && (
              <div style={{ marginTop: "24px", padding: "20px", background: "#fdf2f2", border: "1px solid #fbd5d5", borderRadius: "8px", color: "#9b1c1c" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                   <span style={{ fontSize: "24px" }}>📅</span>
                   <div>
                     <strong>Fully Booked</strong>
                     <p style={{ fontSize: "13px", opacity: 0.8 }}>No rooms available for these dates.</p>
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
