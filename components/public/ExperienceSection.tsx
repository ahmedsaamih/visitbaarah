"use client";

import { useState } from "react";
import MenuModal from "./MenuModal";
import GsapCarousel from "./GsapCarousel";

interface ExperienceProps {
  menuItems: any[];
  services: any[];
  gallery: any[];
}

export default function ExperienceSection({ menuItems, services, gallery }: ExperienceProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const hasDining = menuItems && menuItems.length > 0;
  const hasGallery = gallery && gallery.length > 0;

  if (!hasDining && !hasGallery) return null;

  return (
    <>
      <MenuModal 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        menuItems={menuItems} 
      />

      {/* Dining Section */}
      {hasDining && (
        <section id="dining" className="section" style={{ background: "var(--cream)", overflow: "hidden" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "64px" }} className="reveal">
              <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>RESTAURANT</h4>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>Culinary Delights</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(var(--min-width, 320px), 1fr))", gap: "clamp(32px, 5vw, 60px)", alignItems: "center" }}>
              <div className="reveal">
                <div style={{ 
                  width: "100%", 
                  maxWidth: "400px",
                  margin: "0 auto",
                  aspectRatio: "1/1", 
                  borderRadius: "50%", 
                  overflow: "hidden", 
                  border: "clamp(6px, 1.5vw, 10px) solid #fff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  position: "relative"
                }}>
                  <div style={{ 
                    width: "100%", 
                    height: "100%", 
                    background: "url(/images/hero.png) center/cover",
                    zIndex: 0
                  }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(rgba(13,92,92,0.2), transparent)" }} />
                </div>
              </div>
              <div className="reveal">
                <h3 style={{ fontSize: "clamp(24px, 3vw, 28px)", marginBottom: "32px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>The Chef's Specials</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {menuItems.slice(0, 5).map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1, paddingRight: "20px" }}>
                        <h4 style={{ fontSize: "16px", display: "flex", alignItems: "center", marginBottom: "4px" }}>
                          {item.name} {item.isVegetarian && <span style={{ fontSize: "12px", marginLeft: "8px", color: "green" }}>🌱</span>}
                        </h4>
                        <p style={{ fontSize: "13px", color: "var(--text-light)" }}>{item.description}</p>
                      </div>
                      <span style={{ fontWeight: "700", color: "var(--teal)" }}>${item.price}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="btn-luxury" 
                  style={{ marginTop: "40px", width: "100%" }}
                >
                  View Full Menu
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section - Overlapping Staggered Layout */}
      {hasGallery && (
        <section id="gallery" className="section" style={{ background: "#fff", overflow: "hidden", paddingBottom: "clamp(60px, 10vw, 100px)" }}>
          <div className="container" style={{ textAlign: "center", marginBottom: "clamp(40px, 8vw, 80px)" }}>
            <div className="reveal">
              <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>GALLERY</h4>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>Island Memories</h2>
            </div>
          </div>

          <div style={{ padding: "0 20px" }}>
             <GsapCarousel showArrows={false} showDots={false}>
                {Array.from({ length: Math.ceil(gallery.length / 4) }).map((_, rowIndex) => (
                  <div key={rowIndex} style={{ 
                    display: "flex", 
                    gap: "clamp(12px, 3vw, 40px)", 
                    alignItems: "center", 
                    justifyContent: "center",
                    padding: "40px 0",
                    height: "clamp(350px, 50vh, 500px)"
                  }}>
                    {gallery.slice(rowIndex * 4, rowIndex * 4 + 4).map((item, idx) => (
                      <div key={item.id} className="reveal" style={{ 
                        width: "clamp(140px, 20vw, 300px)",
                        height: idx % 2 === 0 ? "clamp(200px, 30vw, 400px)" : "clamp(160px, 24vw, 320px)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        background: "var(--border)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        transform: `rotate(${idx % 2 === 0 ? (idx + 1) * 2 : -(idx + 1) * 2}deg) translateY(${idx % 2 === 0 ? "-5px" : "15px"})`,
                        flexShrink: 0,
                        zIndex: idx,
                        marginLeft: idx === 0 ? 0 : "clamp(-40px, -5vw, -60px)", // Overlap effect
                        transition: "all 0.5s ease"
                      }}>
                        <img 
                          src={item.url} 
                          alt={item.alt || ""} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          className="hover-bright"
                        />
                      </div>
                    ))}
                  </div>
                ))}
             </GsapCarousel>
          </div>
          <style jsx>{`
            .hover-bright { transition: all 0.5s ease; filter: brightness(0.9); }
            .hover-bright:hover { filter: brightness(1.1); transform: scale(1.05); }
          `}</style>
        </section>
      )}
    </>
  );
}
