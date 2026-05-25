const markers = [
  { year: "1558", label: "Portuguese forces seize Malé" },
  { year: "1573", label: "Liberation from Baarah's shores" },
  { year: "2018", label: "Wetlands formally protected" },
  { year: "Soon", label: "Heritage museum in planning" },
];

export default function HeritageSection() {
  return (
    <section
      id="heritage"
      style={{
        background: "var(--cream)",
        padding: "clamp(80px, 12vw, 140px) 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Ghost year */}
      <div
        style={{
          position: "absolute",
          bottom: "-4%",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "clamp(80px, 18vw, 240px)",
          fontWeight: 900,
          color: "rgba(0,0,0,0.03)",
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        1573
      </div>

      <div className="container" style={{ position: "relative" }}>
        <div className="heritage-inner">

          {/* Left: story */}
          <div className="s-up">
            <p className="overline" style={{ marginBottom: "16px" }}>Living History</p>
            <h2
              style={{
                fontSize: "clamp(36px, 5.5vw, 64px)",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.5px",
                marginBottom: "32px",
                color: "var(--text)",
              }}
            >
              The Ship that<br />
              <span style={{ color: "var(--green)", fontStyle: "italic", fontWeight: 300 }}>
                Freed a Nation
              </span>
            </h2>

            <p style={{ color: "var(--text-mid)", fontSize: "16px", lineHeight: 1.85, marginBottom: "20px" }}>
              In the deep shade of Baarah&apos;s mangroves, in secret, a ship was built. Its name was{" "}
              <em>Kalhuohfummi</em> — the Black Vessel. Here, in the mid-16th century, Sultan Muhammad
              Thakurufaanu and his brothers sheltered and prepared the campaign that would end fifteen years
              of Portuguese occupation of the Maldives.
            </p>
            <p style={{ color: "var(--text-light)", fontSize: "15px", lineHeight: 1.85, marginBottom: "48px" }}>
              Launching from these shores, Kalhuohfummi carried fighters who, through years of guerrilla
              raids, dismantled Portuguese control island by island. When Malé fell in 1573, a nation was
              reborn. Thakurufaanu became Sultan — the most revered figure in Maldivian history — and the
              Maldives still celebrates this date as National Day. The mangroves of Baarah were not just a
              hiding place; they were the cradle of Maldivian independence.
            </p>

            {/* Timeline markers */}
            <div className="heritage-markers">
              {markers.map((m) => (
                <div key={m.year} className="heritage-marker">
                  <div className="heritage-marker-year">{m.year}</div>
                  <div className="heritage-marker-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: quote card */}
          <div className="heritage-quote-side s-up">
            <div className="heritage-quote-card">
              <div
                style={{
                  fontSize: "clamp(52px, 8vw, 88px)",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "var(--gold-light)",
                  letterSpacing: "-3px",
                  marginBottom: "8px",
                }}
              >
                1573
              </div>
              <div
                style={{
                  width: "40px",
                  height: "2px",
                  background: "var(--gold)",
                  marginBottom: "28px",
                }}
              />
              <p
                style={{
                  fontSize: "clamp(15px, 1.8vw, 18px)",
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.75,
                  marginBottom: "32px",
                  fontWeight: 300,
                }}
              >
                &ldquo;Built in secret within Baarah&apos;s mangroves, Kalhuohfummi carried the men who would
                free the Maldives from fifteen years of foreign rule.&rdquo;
              </p>
              <div
                style={{
                  paddingTop: "24px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "11px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: 600,
                  lineHeight: 1.6,
                }}
              >
                Sultan Muhammad Thakurufaanu al-A&apos;uzam<br />
                <span style={{ color: "rgba(255,255,255,0.2)" }}>National Hero of the Maldives</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
