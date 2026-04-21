"use client";

interface ExperienceProps {
  menuItems: any[];
  services: any[];
  gallery: any[];
}

export default function ExperienceSection({ menuItems, services, gallery }: ExperienceProps) {
  return (
    <>
      {/* Dining Section */}
      <section id="dining" className="section" style={{ background: "var(--cream)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }} className="reveal">
            <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>RESTAURANT</h4>
            <h2 style={{ fontSize: "48px" }}>Culinary Delights</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px" }}>
            <div className="reveal">
              <div style={{ 
                width: "100%", 
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
                {menuItems.slice(0, 4).map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <h4 style={{ fontSize: "18px", display: "flex", alignItems: "center" }}>
                        {item.name} {item.isVegetarian && <span style={{ fontSize: "14px", marginLeft: "8px" }}>🌱</span>}
                      </h4>
                      <p style={{ fontSize: "13px", color: "var(--text-light)" }}>{item.description}</p>
                    </div>
                    <span style={{ fontWeight: "700", color: "var(--teal)" }}>${item.price}</span>
                  </div>
                ))}
              </div>
              <button className="btn-luxury" style={{ marginTop: "40px" }}>View Full Menu</button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }} className="reveal">
            <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>GALLERY</h4>
            <h2 style={{ fontSize: "48px" }}>Island Memories</h2>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gridAutoRows: "250px",
            gap: "16px" 
          }}>
            {gallery.map((item, idx) => (
              <div key={item.id} className="reveal" style={{ 
                gridColumn: idx % 3 === 0 ? "span 1" : "span 1",
                gridRow: idx % 4 === 1 ? "span 2" : "span 1",
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
    </>
  );
}
