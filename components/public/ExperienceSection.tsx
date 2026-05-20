"use client";

import { useState } from "react";
import MenuModal from "./MenuModal";

interface MenuItem {
  id: number; name: string; description: string | null;
  price: string; category: string; isVegetarian: boolean;
}
interface GalleryItem { id: number; url: string; alt?: string | null; }
interface ExperienceProps {
  menuItems: MenuItem[];
  gallery: GalleryItem[];
  diningImageUrl?: string;
}

export default function ExperienceSection({ menuItems, gallery, diningImageUrl }: ExperienceProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasDining  = menuItems.length > 0;
  const hasGallery = gallery.length > 0;
  if (!hasDining && !hasGallery) return null;

  const diningImg = diningImageUrl || "/images/hero.png";

  return (
    <>
      <MenuModal isOpen={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />

      {/* ─── Dining ──────────────────────────────────────────── */}
      {hasDining && (
        <section id="dining" style={{ background: "var(--cream)", padding: "clamp(80px, 12vw, 140px) 0", overflow: "hidden" }}>
          <div className="container">
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(40px, 7vw, 96px)",
              alignItems: "center",
            }}>
              {/* Image side */}
              <div className="slide-in-left" style={{ position: "relative" }}>
                <div
                  className="parallax-wrap reveal-img"
                  style={{
                    aspectRatio: "4/5",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
                  }}
                >
                  <div
                    className="parallax-img"
                    style={{ backgroundImage: `url(${diningImg})` }}
                  />
                </div>
              </div>

              {/* Menu side */}
              <div className="slide-in-right">
                <p className="overline" style={{ marginBottom: "20px" }}>Dining</p>
                <h2 style={{
                  fontSize: "clamp(32px, 4.5vw, 56px)",
                  letterSpacing: "-0.5px",
                  marginBottom: "12px",
                  lineHeight: 1.05,
                }}>
                  Eat &amp; Drink<br />on Baarah
                </h2>
                <div className="line-expand" style={{ width: "48px", height: "2px", background: "var(--gold)", marginBottom: "28px" }} />
                <p style={{ color: "var(--text-light)", fontSize: "15px", lineHeight: 1.8, marginBottom: "36px" }}>
                  Freshly caught seafood, island-grown produce, and the flavours of traditional Maldivian cooking.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {menuItems.slice(0, 5).map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        gap: "16px",
                        padding: "18px 0",
                        borderBottom: idx < Math.min(4, menuItems.length - 1) ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: "15px", fontWeight: 600,
                          marginBottom: "3px",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}>
                          {item.name}
                          {item.isVegetarian && <span style={{ fontSize: "11px", color: "var(--green)", fontWeight: 400 }}>veg</span>}
                        </h4>
                        <p style={{ fontSize: "13px", color: "var(--text-light)", lineHeight: 1.5 }}>{item.description}</p>
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--green)", flexShrink: 0, fontSize: "15px" }}>
                        ${item.price}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setMenuOpen(true)}
                  className="btn-luxury"
                  style={{ marginTop: "32px", width: "100%", justifyContent: "center" }}
                >
                  View Full Menu
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 760px) {
              #dining .container > div { grid-template-columns: 1fr !important; }
              #dining .slide-in-left { display: none; }
            }
          `}</style>
        </section>
      )}

      {/* ─── Gallery ──────────────────────────────────────────── */}
      {hasGallery && (
        <section id="gallery" style={{ background: "#fff", padding: "clamp(80px, 12vw, 140px) 0" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "clamp(48px, 8vw, 72px)", flexWrap: "wrap", gap: "24px" }}>
              <div>
                <p className="overline s-up" style={{ marginBottom: "14px" }}>Gallery</p>
                <h2 className="s-up" style={{ fontSize: "clamp(36px, 5vw, 60px)", letterSpacing: "-0.5px" }}>
                  Baarah in Photos
                </h2>
              </div>
              <p className="s-up" style={{ maxWidth: "340px", color: "var(--text-light)", fontSize: "15px", lineHeight: 1.75 }}>
                A glimpse of island life — captured by those who love it.
              </p>
            </div>

            <div className="gallery-masonry">
              {gallery.map(item => (
                <div key={item.id} className="gallery-masonry-item reveal-img">
                  <img src={item.url} alt={item.alt || "Baarah"} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
