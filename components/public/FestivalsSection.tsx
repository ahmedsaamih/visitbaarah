type CulturalEvent = {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  shortDescription: string | null;
  period: string | null;
  media: { url: string; alt: string | null }[];
};

interface Props {
  events: CulturalEvent[];
}

export default function FestivalsSection({ events }: Props) {
  return (
    <section
      id="festivals"
      style={{
        background: "var(--forest)",
        color: "#fff",
        padding: "clamp(80px, 12vw, 140px) 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Ghost background word */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(100px, 24vw, 360px)",
          fontWeight: 900,
          lineHeight: 1,
          color: "rgba(255,255,255,0.018)",
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-10px",
        }}
      >
        EID
      </div>

      <div className="container" style={{ position: "relative" }}>

        {/* Header */}
        <div className="festival-header s-up">
          <div>
            <p className="overline" style={{ color: "var(--gold)", marginBottom: "14px" }}>
              Celebrations &amp; Culture
            </p>
            <h2
              style={{
                fontSize: "clamp(36px, 5.5vw, 64px)",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.5px",
                color: "#fff",
              }}
            >
              The Island at<br />
              <span style={{ color: "var(--gold-light)", fontStyle: "italic", fontWeight: 300 }}>
                Full Celebration
              </span>
            </h2>
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.52)", fontSize: "16px", lineHeight: 1.85, marginBottom: "20px" }}>
              Baarah is recognised across the Maldives as a model village for cultural preservation. When Eid arrives, the island transforms — Bodu Beru drums thunder through the night, ghost dancers parade the streets, and the entire community feasts together with doors open to everyone.
            </p>
            <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "14px", lineHeight: 1.75 }}>
              These are not performances staged for visitors. They are living traditions in which you are welcomed not as an observer, but as a guest.
            </p>
          </div>
        </div>

        {/* Events grid — only rendered when DB has events */}
        {events.length > 0 && (
          <div className="festival-grid">
            {events.map((event) => {
              const img = event.media?.[0]?.url;
              return (
                <div key={event.id} className="festival-card s-up">
                  {img && (
                    <div style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      overflow: "hidden",
                      borderRadius: "0",
                      marginBottom: "0",
                      flexShrink: 0,
                    }}>
                      <img
                        src={img}
                        alt={event.name}
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}
                  <div style={{ padding: "clamp(18px, 2.5vw, 28px)", display: "flex", flexDirection: "column", flex: 1 }}>
                    {event.category && (
                      <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "2.5px", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>
                        {event.category}
                      </span>
                    )}
                    <h3 className="festival-card-title">{event.name}</h3>
                    <p className="festival-card-body">
                      {event.shortDescription || event.description}
                    </p>
                    {event.period && (
                      <div className="festival-card-when">{event.period}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA strip */}
        <div className="festival-cta s-up">
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "8px" }}>
              Plan your visit
            </p>
            <p style={{ fontSize: "clamp(17px, 2vw, 21px)", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>
              Come for Eid. Discover the real Maldives.
            </p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>
              Eid dates follow the Islamic lunar calendar — they shift roughly 11 days earlier each year.
              Plan well ahead; local guesthouses fill quickly during Eid season.
            </p>
          </div>
          <a
            href="/businesses"
            className="btn-outline-gold"
            style={{ padding: "14px 32px", fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Find a Guesthouse
          </a>
        </div>

      </div>
    </section>
  );
}
