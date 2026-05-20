"use client";

import GsapCarousel from "./GsapCarousel";

type RoomType = {
  id: number;
  name: string;
  basePrice: string;
  description?: string | null;
  size?: string | null;
  bedType?: string | null;
  maxGuests: number;
  media?: Array<{ url: string }>;
};

interface RoomTypeProps {
  roomTypes: RoomType[];
}

export default function RoomTypesSection({ roomTypes }: RoomTypeProps) {
  if (!roomTypes || roomTypes.length === 0) return null;

  return (
    <section id="stay" className="section" style={{ background: "var(--cream)", overflow: "hidden" }}>
      <div className="container">
        <div className="reveal" style={{ textAlign: "center", marginBottom: "clamp(40px, 8vw, 72px)" }}>
          <p className="overline" style={{ marginBottom: "16px" }}>Where to Stay</p>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", marginBottom: "16px" }}>Accommodation on Baarah</h2>
          <p style={{ color: "var(--text-light)", maxWidth: "480px", margin: "0 auto", fontSize: "15px" }}>
            From cosy guesthouses to beachfront stays — find the perfect place to rest on the island.
          </p>
        </div>

        <GsapCarousel showArrows={true} showDots={true}>
          {roomTypes.map((type) => {
            const displayImage = type.media?.[0]?.url || "/images/hero.png";
            return (
              <div key={type.id} style={{ padding: "0 12px" }}>
                <div
                  className="card-island responsive-card"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    overflow: "hidden",
                    minHeight: "460px",
                  }}
                >
                  <div
                    style={{
                      background: `url(${displayImage}) center/cover`,
                      minHeight: "320px",
                    }}
                  />
                  <div
                    style={{
                      padding: "clamp(28px, 5vw, 52px)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", marginBottom: "6px" }}>{type.name}</h3>
                        <p style={{ color: "var(--gold)", fontWeight: 600, fontSize: "13px", letterSpacing: "1px" }}>
                          {type.size && `${type.size} · `}{type.bedType}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--teal)" }}>${type.basePrice}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-light)" }}>per night</div>
                      </div>
                    </div>

                    <p style={{ fontSize: "15px", color: "var(--text-light)", marginBottom: "28px", lineHeight: 1.7 }}>
                      {type.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        fontSize: "13px",
                        marginBottom: "28px",
                        padding: "16px 0",
                        borderTop: "1px solid var(--border)",
                        borderBottom: "1px solid var(--border)",
                        color: "var(--text-light)",
                      }}
                    >
                      <span>Up to {type.maxGuests} guests</span>
                      <span className="hide-mobile">Free Wi-Fi</span>
                      <span>Island setting</span>
                    </div>

                    <a
                      href="mailto:info@visitbaarah.mv"
                      className="btn-luxury"
                      style={{ textAlign: "center" }}
                    >
                      Enquire About This Stay
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </GsapCarousel>
      </div>
      <style jsx>{`
        @media (max-width: 600px) {
          .card-island { min-height: auto !important; }
        }
      `}</style>
    </section>
  );
}
