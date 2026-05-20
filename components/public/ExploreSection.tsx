"use client";

interface Tour {
  id: number;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  price: string;
  priceUnit: string;
  duration?: string | null;
  media?: Array<{ url: string }>;
}

interface ExploreSectionProps {
  tours: Tour[];
}

export default function ExploreSection({ tours }: ExploreSectionProps) {
  if (!tours || tours.length === 0) return null;

  return (
    <section id="explore" className="section" style={{ background: "var(--cream)", overflow: "hidden" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "clamp(40px, 8vw, 72px)" }} className="reveal">
          <p className="overline" style={{ marginBottom: "16px" }}>Explore</p>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", marginBottom: "16px" }}>Nature & Attractions</h2>
          <p style={{ color: "var(--text-light)", maxWidth: "520px", margin: "0 auto", fontSize: "16px" }}>
            From secluded beaches to lush farmland — discover what makes Baarah unlike anywhere else.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "clamp(20px, 3vw, 32px)",
          }}
        >
          {tours.map((item) => {
            const img = item.media?.[0]?.url || "/images/hero.png";
            return (
              <div key={item.id} className="reveal card-island">
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16/10",
                    backgroundImage: `url(${img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(14,46,26,0.5) 0%, transparent 60%)",
                    }}
                  />
                </div>
                <div style={{ padding: "clamp(20px, 3vw, 28px)" }}>
                  <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>{item.name}</h3>
                  <p style={{ color: "var(--text-light)", fontSize: "14px", lineHeight: "1.65", marginBottom: "16px" }}>
                    {item.shortDescription || item.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid var(--border)", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-light)" }}>{item.duration}</span>
                    <span style={{ fontWeight: 700, color: "var(--teal)" }}>
                      ${item.price} <span style={{ fontWeight: 400, color: "var(--text-light)" }}>/ {item.priceUnit.replace("_", " ")}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
