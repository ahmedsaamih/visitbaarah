"use client";

import GsapCarousel from "./GsapCarousel";

interface ActivitiesProps {
  activities: any[];
}

export default function ActivitiesSection({ activities }: ActivitiesProps) {
  if (!activities || activities.length === 0) return null;

  return (
    <section id="events" className="section" style={{ background: "#fff", overflow: "hidden" }}>
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            marginBottom: "clamp(32px, 8vw, 64px)",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div className="reveal">
            <p className="overline" style={{ marginBottom: "14px" }}>Events</p>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)" }}>What&apos;s On in Baarah</h2>
          </div>
          <p className="reveal" style={{ maxWidth: "380px", color: "var(--text-light)", paddingBottom: "8px", fontSize: "15px" }}>
            Cultural celebrations, sports events, and community gatherings — there&apos;s always something happening on the island.
          </p>
        </div>

        <GsapCarousel showArrows={true} showDots={true}>
          {activities.map((item) => {
            const displayImage = item.media?.[0]?.url || "/images/hero.png";
            return (
              <div key={item.id} style={{ padding: "0 10px" }}>
                <div
                  className="reveal"
                  style={{
                    position: "relative",
                    borderRadius: "16px",
                    overflow: "hidden",
                    aspectRatio: "3/4",
                    cursor: "pointer",
                    width: "100%",
                    maxWidth: "420px",
                    margin: "0 auto",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundImage: `url(${displayImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      transition: "transform 0.5s",
                    }}
                    className="hover-scale"
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(14,46,26,0.9) 0%, rgba(14,46,26,0.1) 55%, transparent 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "clamp(20px, 4vw, 28px)",
                    }}
                  >
                    <h3 style={{ color: "#fff", fontSize: "clamp(18px, 2.5vw, 22px)", marginBottom: "8px" }}>
                      {item.name}
                    </h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--gold)", fontSize: "15px", fontWeight: 600 }}>
                        {item.duration}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}>
                        ${item.price} / {item.priceUnit.replace("_", " ")}
                      </span>
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
