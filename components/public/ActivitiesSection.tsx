"use client";

interface ActivitiesProps {
  activities: any[];
}

export default function ActivitiesSection({ activities }: ActivitiesProps) {
  return (
    <section id="activities" className="section" style={{ background: "#fff" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "64px" }}>
          <div className="reveal">
            <h4 style={{ color: "var(--gold)", letterSpacing: "2px", marginBottom: "16px" }}>EXPERIENCES</h4>
            <h2 style={{ fontSize: "48px" }}>Island Activities</h2>
          </div>
          <p className="reveal" style={{ maxWidth: "400px", color: "var(--text-light)", paddingBottom: "8px" }}>
            Unforgettable adventures await. From diving with mantas to sunset dinner on a private sandbank.
          </p>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: "24px" 
        }}>
          {activities.map((item) => (
            <div key={item.id} className="reveal" style={{ 
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              aspectRatio: "1/1",
              cursor: "pointer"
            }}>
              <div style={{ 
                width: "100%", 
                height: "100%", 
                background: "var(--border)",
                backgroundImage: item.image ? `url(${item.image})` : "url(/images/hero.png)",
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
                background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "24px"
              }}>
                <h3 style={{ color: "#fff", fontSize: "20px", marginBottom: "4px" }}>{item.name}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ color: "var(--gold)", fontSize: "14px", fontWeight: "600" }}>${item.price} {item.priceUnit.replace("_", " ")}</span>
                   <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>{item.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .hover-scale:hover { transform: scale(1.1); }
      `}</style>
    </section>
  );
}
