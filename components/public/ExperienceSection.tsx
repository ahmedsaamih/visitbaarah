"use client";

interface ExperienceProps {
  menuItems: any[];
  services: any[];
  gallery: any[];
}

export default function ExperienceSection({ menuItems, services, gallery }: ExperienceProps) {
  const hasDining = menuItems && menuItems.length > 0;
  const hasGallery = gallery && gallery.length > 0;

  if (!hasDining && !hasGallery) return null;

  return (
    <>
      {/* Dining Section */}
      {hasDining && (
        <section id="dining" className="section" style={{ background: "var(--cream)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "64px" }} className="reveal">
              <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>RESTAURANT</h4>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>Culinary Delights</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "60px", alignItems: "center" }}>
              <div className="reveal">
                <div style={{ 
                  width: "100%", 
                  maxWidth: "400px",
                  margin: "0 auto",
                  aspectRatio: "1/1", 
                  borderRadius: "50%", 
                  overflow: "hidden", 
                  border: "10px solid #fff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ width: "100%", height: "100%", background: "url(/images/hero.png) center/cover" }} />
                </div>
              </div>
              <div className="reveal">
                <h3 style={{ fontSize: "28px", marginBottom: "32px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>The Chef's Specials</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {menuItems.slice(0, 5).map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1, paddingRight: "20px" }}>
                        <h4 style={{ fontSize: "18px", display: "flex", alignItems: "center", marginBottom: "4px" }}>
                          {item.name} {item.isVegetarian && <span style={{ fontSize: "14px", marginLeft: "8px", color: "green" }} title="Vegetarian">🌱</span>}
                        </h4>
                        <p style={{ fontSize: "13px", color: "var(--text-light)" }}>{item.description}</p>
                      </div>
                      <span style={{ fontWeight: "700", color: "var(--teal)" }}>${item.price}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-luxury" style={{ marginTop: "40px", width: "100%" }}>View Full Menu</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {hasGallery && (
        <section id="gallery" className="section" style={{ background: "#fff" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "64px" }} className="reveal">
              <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>GALLERY</h4>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>Island Memories</h2>
            </div>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
              gridAutoRows: "250px",
              gap: "16px" 
            }}>
              {gallery.map((item, idx) => (
                <div key={item.id} className="reveal" style={{ 
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "var(--border)"
                }}>
                  <img src={item.url} alt={item.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
