"use client";

interface Service {
  id: number;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  price?: string | null;
  priceUnit: string;
}

interface TransportSectionProps { services: Service[]; }

const defaultOptions = [
  { icon: "🛺", title: "Buggy Hire",    desc: "Explore the island at your own pace" },
  { icon: "🚗", title: "Taxi Service",  desc: "On-demand rides across the island" },
  { icon: "🚤", title: "Boat Trips",    desc: "Day trips and inter-island transfers" },
  { icon: "🗺️", title: "Island Tours", desc: "Guided exploration with locals" },
];

export default function TransportSection({ services }: TransportSectionProps) {
  return (
    <section
      id="transport"
      style={{
        background: "var(--deep)",
        color: "#fff",
        padding: "clamp(80px, 12vw, 140px) 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Ghost number */}
      <div style={{
        position: "absolute", top: "-4%", right: "-2%",
        fontSize: "clamp(120px, 20vw, 240px)",
        fontWeight: 900, lineHeight: 1,
        color: "rgba(255,255,255,0.025)",
        userSelect: "none", pointerEvents: "none",
      }}>04</div>

      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(40px, 7vw, 96px)",
          alignItems: "center",
        }}>

          {/* Left: copy */}
          <div className="slide-in-left">
            <p className="overline" style={{ marginBottom: "20px", color: "var(--gold)" }}>
              Getting Around
            </p>
            <h2 style={{
              fontSize: "clamp(36px, 5.5vw, 60px)",
              color: "#fff", lineHeight: 1.05,
              marginBottom: "24px", letterSpacing: "-0.5px",
            }}>
              Explore Every Corner of Baarah
            </h2>
            <div className="line-expand" style={{ width: "56px", height: "2px", background: "var(--gold)", marginBottom: "28px" }} />
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", lineHeight: 1.8, marginBottom: "40px" }}>
              Baarah is best experienced at your own pace. Hire a buggy, arrange a taxi,
              or get out on the water — we&apos;ll connect you with the right option.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {defaultOptions.map(o => (
                <div
                  key={o.title}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>{o.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{o.title}</div>
                  <div style={{ fontSize: "12px", opacity: 0.45, lineHeight: 1.5 }}>{o.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: services or CTA */}
          <div className="slide-in-right">
            {services.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {services.map(s => (
                  <div
                    key={s.id}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      padding: "20px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>{s.name}</div>
                      <div style={{ fontSize: "13px", opacity: 0.45 }}>{s.shortDescription || s.description}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {s.price ? (
                        <>
                          <div style={{ fontWeight: 700, fontSize: "20px", color: "var(--gold-light)" }}>${s.price}</div>
                          <div style={{ fontSize: "11px", opacity: 0.4 }}>{s.priceUnit.replace("_", " ")}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: "13px", opacity: 0.5 }}>Enquire</div>
                      )}
                    </div>
                  </div>
                ))}
                <a
                  href="mailto:info@visitbaarah.mv"
                  className="btn-luxury"
                  style={{ textAlign: "center", marginTop: "8px", background: "var(--gold)" }}
                >
                  Enquire Now
                </a>
              </div>
            ) : (
              <div style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "clamp(36px, 5vw, 56px)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "52px", marginBottom: "20px" }}>🛺</div>
                <h3 style={{ fontSize: "22px", marginBottom: "12px", color: "#fff" }}>Need a Ride?</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", marginBottom: "32px", lineHeight: 1.7 }}>
                  Reach out and we&apos;ll connect you with local transport — buggies, taxis, boat trips, and guided tours.
                </p>
                <a href="mailto:info@visitbaarah.mv" className="btn-luxury" style={{ width: "100%", textAlign: "center", background: "var(--gold)" }}>
                  Get in Touch
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          #transport .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
