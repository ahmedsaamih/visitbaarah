"use client";

import { useEffect, useRef } from "react";

interface RoomTypeProps {
  roomTypes: any[];
}

export default function RoomTypesSection({ roomTypes }: RoomTypeProps) {
  return (
    <section id="rooms" className="section" style={{ background: "var(--cream)" }}>
      <div className="container">
        <div className="reveal" style={{ textAlign: "center", marginBottom: "64px" }}>
          <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>ACCOMMODATION</h4>
          <h2 style={{ fontSize: "48px" }}>Rooms & Suites</h2>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
          gap: "40px" 
        }}>
          {roomTypes.map((type) => (
            <div key={type.id} className="card-island reveal">
              <div style={{ 
                height: "280px", 
                background: "var(--border)",
                backgroundImage: type.images?.[0] ? `url(${type.images[0]})` : "url(/images/hero.png)",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }} />
              <div style={{ padding: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "24px" }}>{type.name}</h3>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--teal)" }}>${type.basePrice}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-light)" }}>per night</div>
                  </div>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-light)", marginBottom: "24px", height: "42px", overflow: "hidden" }}>
                  {type.description}
                </p>
                <div style={{ 
                  display: "flex", 
                  gap: "16px", 
                  fontSize: "13px", 
                  color: "var(--text)", 
                  padding: "16px 0",
                  borderTop: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  marginBottom: "24px"
                }}>
                  <span>📏 {type.size || "30sqm"}</span>
                  <span>👥 Max {type.maxGuests} Guests</span>
                  <span>🛏️ {type.bedType || "King Bed"}</span>
                </div>
                <a href="#booking" className="btn-outline-gold" style={{ width: "100%", textAlign: "center" }}>Check Availability</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
