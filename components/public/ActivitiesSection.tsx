"use client";

import GsapCarousel from "./GsapCarousel";

interface ActivitiesProps {
  activities: any[];
}

export default function ActivitiesSection({ activities }: ActivitiesProps) {
  if (!activities || activities.length === 0) return null;

  return (
    <section id="activities" className="section" style={{ background: "#fff", overflow: "hidden" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "clamp(32px, 8vw, 64px)", flexWrap: "wrap", gap: "24px" }}>
          <div className="reveal">
            <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>EXPERIENCES</h4>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>Island Activities</h2>
          </div>
          <p className="reveal" style={{ maxWidth: "400px", color: "var(--text-light)", paddingBottom: "8px" }}>
            Unforgettable adventures await. From diving with mantas to sunset dinner on a private sandbank.
          </p>
        </div>

        <GsapCarousel showArrows={true} showDots={true}>
          {activities.map((item) => {
            const displayImage = item.media?.[0]?.url || "/images/hero.png";
            
            return (
              <div key={item.id} style={{ padding: "0 10px" }}>
                <div className="reveal" style={{ 
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  aspectRatio: "1/1",
                  cursor: "pointer",
                  width: "100%",
                  maxWidth: "500px",
                  margin: "0 auto"
                }}>
                  <div style={{ 
                    width: "100%", 
                    height: "100%", 
                    background: "var(--border)",
                    backgroundImage: `url(${displayImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "transform 0.5s"
                  }} className="hover-scale" />
                  <div style={{ 
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "clamp(20px, 4vw, 32px)"
                  }}>
                    <h3 style={{ color: "#fff", fontSize: "clamp(20px, 3vw, 24px)", marginBottom: "8px" }}>{item.name}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <span style={{ color: "var(--gold)", fontSize: "16px", fontWeight: "600" }}>${item.price} {item.priceUnit.replace("_", " ")}</span>
                       <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>{item.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </GsapCarousel>
      </div>
      <style jsx>{`
        .hover-scale:hover { transform: scale(1.05); }
      `}</style>
    </section>
  );
}
