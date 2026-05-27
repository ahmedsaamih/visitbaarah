const traditions = [
  {
    num: "01",
    category: "Rites",
    title: "Bodu Mas & the Ghost Dance",
    body: "On Bodu Eid, islanders weave a giant fish from coconut palm leaves and reenact its capture from the sea — a ritual rooted in ancient Maldivian legend. Then the Maali arrive: performers painted black, costumed in coconut-leaf skirts and carved masks, parading through the streets to the thunder of Bodu Beru drums. Equal parts folklore, theatre, and living community ritual.",
    when: "Eid al-Adha · Bodu Eid",
  },
  {
    num: "02",
    category: "Music",
    title: "Bodu Beru Nights",
    body: "Twenty performers. Coconut-wood drums with goatskin stretched over the heads. The rhythm begins slow and meditative, then builds — faster, louder — until dancers break into uncontrolled, trance-like movement and anyone standing nearby finds themselves drawn in. Rooted in ancient African musical traditions, Bodu Beru has been the sound of Baarah's celebrations for centuries.",
    when: "All festive occasions",
  },
  {
    num: "03",
    category: "Kuda Eid",
    title: "The Open-Door Feast",
    body: "Eid al-Fitr begins with communal prayer at sunrise, then every door on the island opens. Eid boakibaa, gulha, kulhi boakibaa, huni hakuru folhi, bondi bai — households prepare all morning and neighbours move freely between homes sharing food throughout the day. The entire island becomes one long, open table.",
    when: "Eid al-Fitr · Kuda Eid",
  },
  {
    num: "04",
    category: "Sport",
    title: "Bashi & the Games of Eid",
    body: "Bashi — the traditional Maldivian women's sport, played on sand — goes to tournament mode during Eid. Also look for Kodi Jehun, Eid Vedhumaa Dhiun, and Baibalaa competitions. These are not organised events for spectators; they are community sport played under open sky, watched and cheered by everyone on the island.",
    when: "Eid holidays & National Days",
  },
  {
    num: "05",
    category: "History",
    title: "National Day — Liberation's Island",
    body: "The first day of the third Islamic month marks Maldivian National Day — the liberation from Portuguese rule in 1573, a campaign prepared and launched from Baarah's shores. The day is celebrated here with processions and cultural performances that carry the rare weight of happening on the island where history was actually made.",
    when: "1st Rabī' al-Awwal",
  },
  {
    num: "06",
    category: "Evening",
    title: "Undhoali & the Festive Evening",
    body: "As festive evenings cool, the carved wooden Undhoali swings come alive across the island. Families gather around these communal hanging chairs — a tradition older than anyone can trace, unchanged, still anchoring the social heart of Baarah's festival nights after the drumming quietens.",
    when: "Festive evenings",
  },
];

export default function FestivalsSection() {
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

        {/* Traditions grid */}
        <div className="festival-grid">
          {traditions.map((t) => (
            <div key={t.num} className="festival-card s-up">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "2.5px", color: "var(--gold)", textTransform: "uppercase" }}>
                  {t.category}
                </span>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.14)", fontWeight: 700 }}>
                  {t.num}
                </span>
              </div>
              <h3 className="festival-card-title">{t.title}</h3>
              <p className="festival-card-body">{t.body}</p>
              <div className="festival-card-when">{t.when}</div>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div
          className="festival-cta s-up"
        >
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
