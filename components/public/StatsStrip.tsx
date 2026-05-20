export default function StatsStrip() {
  const stats = [
    { icon: "📍", label: "Atoll", value: "Haa Alif" },
    { icon: "🌿", label: "Known For", value: "Agriculture & Nature" },
    { icon: "🏖️", label: "Coastline", value: "Pristine Beaches" },
    { icon: "✈️", label: "Nearest Airport", value: "Hanimaadhoo (HAQ)" },
  ];

  return (
    <div
      style={{
        background: "var(--teal)",
        color: "#fff",
        padding: "clamp(20px, 4vw, 28px) 0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "clamp(16px, 3vw, 32px)",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "22px" }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: "11px", opacity: 0.65, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "2px" }}>
                  {s.label}
                </div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
