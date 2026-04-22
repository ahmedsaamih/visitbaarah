"use client";

import { useEffect, useRef } from "react";
import GsapCarousel from "./GsapCarousel";

interface RoomTypeProps {
  roomTypes: any[];
}

export default function RoomTypesSection({ roomTypes }: RoomTypeProps) {
  if (!roomTypes || roomTypes.length === 0) return null;

  return (
    <section id="rooms" className="section" style={{ background: "var(--cream)", overflow: "hidden" }}>
      <div className="container">
        <div className="reveal" style={{ textAlign: "center", marginBottom: "64px" }}>
          <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>ACCOMMODATION</h4>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>Rooms & Suites</h2>
        </div>

        <GsapCarousel showArrows={true} showDots={true}>
          {roomTypes.map((type) => {
            const displayImage = type.media?.[0]?.url || "/images/hero.png";
            
            return (
              <div key={type.id} style={{ padding: "0 12px" }}>
                <div className="card-island responsive-card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0", overflow: "hidden", minHeight: "500px" }}>
                  <div style={{ 
                    background: `url(${displayImage}) center/cover`,
                    minHeight: "350px",
                    width: "100%"
                  }} />
                  <div style={{ padding: "clamp(24px, 5vw, 60px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "clamp(24px, 4vw, 32px)", marginBottom: "8px" }}>{type.name}</h3>
                        <p style={{ color: "var(--gold)", fontWeight: "600", fontSize: "14px", letterSpacing: "1px" }}>{type.size || "35sqm"} • {type.bedType || "King Bed"}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--teal)" }}>${type.basePrice}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-light)" }}>per night</div>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: "16px", color: "var(--text-light)", marginBottom: "32px", lineHeight: "1.7" }}>
                      {type.description}
                    </p>
                    
                    <div style={{ 
                      display: "flex", 
                      flexWrap: "wrap",
                      gap: "24px", 
                      fontSize: "14px", 
                      marginBottom: "32px",
                      padding: "20px 0",
                      borderTop: "1px solid var(--border)",
                      borderBottom: "1px solid var(--border)"
                    }}>
                      <span>Guests: {type.maxGuests}</span>
                      <span className="hide-mobile">Premium Wi-Fi</span>
                      <span>Island View</span>
                    </div>

                    <a href="#booking" className="btn-luxury" style={{ alignSelf: "flex-start", padding: "16px 40px", width: "100%", textAlign: "center" }}>
                      Check Availability
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </GsapCarousel>
      </div>
      <style jsx>{`
        @media (min-width: 992px) {
          .btn-luxury { width: auto !important; }
        }
        @media (max-width: 600px) {
          .card-island { min-height: auto !important; }
        }
      `}</style>
    </section>
  );
}
