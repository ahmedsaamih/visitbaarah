const features = [
  {
    num: "01",
    title: "39 Hectare Mangrove Forest",
    body: "The largest intact mangrove ecosystem in the Maldives. Baarah's mangroves form a critical nursery for reef fish, sequester carbon, and protect the island's shoreline — a living shield recognised under national law.",
    stat: "39 ha",
    statLabel: "Largest in Maldives",
  },
  {
    num: "02",
    title: "Baarah Corner Dive Site",
    body: "One of the most dramatic dive sites in the northern atolls. This reef edge draws grey reef sharks, manta rays, whale sharks, and hawksbill turtles. Visibility regularly exceeds 30 metres in calm conditions.",
    stat: "30 m+",
    statLabel: "Visibility",
  },
  {
    num: "03",
    title: "Protected Wetland",
    body: "Declared a Protected Area in 2018 under the Maldives Environment Protection and Preservation Act — one of only a handful of nationally recognised wetlands in the archipelago, home to migratory birds and endemic species.",
    stat: "2018",
    statLabel: "Protected since",
  },
];

export default function NatureSection() {
  return (
    <section
      id="nature"
      style={{
        background: "var(--deep)",
        color: "#fff",
        padding: "clamp(80px, 12vw, 140px) 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Ghost background word */}
      <div
        style={{
          position: "absolute",
          top: "-4%",
          right: "-3%",
          fontSize: "clamp(120px, 22vw, 300px)",
          fontWeight: 900,
          lineHeight: 1,
          color: "rgba(255,255,255,0.018)",
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-8px",
        }}
        aria-hidden="true"
      >
        WILD
      </div>

      <div className="container" style={{ position: "relative" }}>
        {/* Header */}
        <div style={{ maxWidth: "680px", marginBottom: "clamp(56px, 8vw, 96px)" }}>
          <p className="overline s-up" style={{ marginBottom: "16px" }}>Natural Heritage</p>
          <h2
            className="s-up"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#fff",
              letterSpacing: "-0.5px",
              marginBottom: "24px",
            }}
          >
            A Living<br />
            <span style={{ color: "var(--gold-light)", fontStyle: "italic", fontWeight: 300 }}>
              Ecosystem
            </span>
          </h2>
          <p className="s-up" style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", lineHeight: 1.8 }}>
            Beyond the beaches, Baarah harbours some of the most significant natural assets in the Maldivian
            archipelago — protected by law, celebrated by scientists, and explored by the few who find their way here.
          </p>
        </div>

        {/* Feature list */}
        <div className="nature-features">
          {features.map((f) => (
            <div key={f.num} className="nature-feature s-up">
              <div className="nature-feature-num">{f.num}</div>
              <div className="nature-feature-body">
                <h3 className="nature-feature-title">{f.title}</h3>
                <p className="nature-feature-desc">{f.body}</p>
              </div>
              <div className="nature-feature-stat">
                <div className="nature-stat-value">{f.stat}</div>
                <div className="nature-stat-label">{f.statLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
