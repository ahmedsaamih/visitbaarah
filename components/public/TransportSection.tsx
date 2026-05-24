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

const defaultFeatures = [
  { num: "01", title: "Buggy Hire",     desc: "Explore every corner of the island at your own pace" },
  { num: "02", title: "Taxi Service",   desc: "On-demand rides from anywhere on Baarah" },
  { num: "03", title: "Boat Trips",     desc: "Day excursions and inter-island transfers" },
  { num: "04", title: "Guided Tours",   desc: "Local expert-led explorations of the island" },
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
        position: "absolute", top: "-4%", right: "-1%",
        fontSize: "clamp(120px, 20vw, 240px)",
        fontWeight: 900, lineHeight: 1,
        color: "rgba(255,255,255,0.025)",
        userSelect: "none", pointerEvents: "none",
      }} aria-hidden="true">04</div>

      <div className="container">
        <div
          className="transport-inner"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(40px, 7vw, 96px)",
            alignItems: "start",
          }}
        >
          {/* Left: copy + feature list */}
          <div className="slide-in-left">
            <p className="overline" style={{ marginBottom: "20px", color: "var(--gold)" }}>
              Getting Around
            </p>
            <h2 style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              color: "#fff", lineHeight: 1.05,
              marginBottom: "20px", letterSpacing: "-0.5px",
            }}>
              Explore Every Corner of Baarah
            </h2>
            <div className="line-expand" style={{ width: "48px", height: "2px", background: "var(--gold)", marginBottom: "24px" }} />
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", lineHeight: 1.8, marginBottom: "40px" }}>
              Baarah is best experienced at your own pace. Hire a buggy, arrange a taxi,
              or get out on the water — we&apos;ll connect you with the right option.
            </p>

            <div className="transport-features">
              {defaultFeatures.map(o => (
                <div key={o.num} className="transport-feature">
                  <span className="transport-feature-num">{o.num}</span>
                  <div>
                    <div className="transport-feature-title">{o.title}</div>
                    <div className="transport-feature-desc">{o.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "36px" }}>
              <a href="/businesses" className="link-arrow" style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>
                Browse transport businesses
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right: live service rates or enquiry CTA */}
          <div className="slide-in-right">
            {services.length > 0 ? (
              <div>
                <p style={{
                  fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
                  opacity: 0.35, fontWeight: 700, marginBottom: "24px",
                }}>
                  Current Rates
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {services.map((s, i) => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        padding: "20px 0",
                        borderBottom: i < services.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "3px" }}>{s.name}</div>
                        <div style={{ fontSize: "13px", opacity: 0.4, lineHeight: 1.5 }}>{s.shortDescription || s.description}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {s.price ? (
                          <>
                            <div style={{ fontWeight: 700, fontSize: "20px", color: "var(--gold-light)" }}>${s.price}</div>
                            <div style={{ fontSize: "11px", opacity: 0.35 }}>{s.priceUnit.replace("_", " ")}</div>
                          </>
                        ) : (
                          <div style={{ fontSize: "13px", opacity: 0.45 }}>Enquire</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href="mailto:info@visitbaarah.mv"
                  className="btn-luxury"
                  style={{ marginTop: "32px", width: "100%", justifyContent: "center", background: "var(--gold)" }}
                >
                  Enquire Now
                </a>
              </div>
            ) : (
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "clamp(36px, 5vw, 56px)",
                textAlign: "center",
              }}>
                <h3 style={{ fontSize: "22px", marginBottom: "12px", color: "#fff", fontWeight: 700 }}>Need a Ride?</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", marginBottom: "32px", lineHeight: 1.7 }}>
                  Reach out and we&apos;ll connect you with local transport — buggies, taxis, boat trips, and guided tours.
                </p>
                <a href="mailto:info@visitbaarah.mv" className="btn-luxury" style={{ width: "100%", justifyContent: "center", background: "var(--gold)" }}>
                  Get in Touch
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
