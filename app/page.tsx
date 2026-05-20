import { db } from "@/db";
import { unstable_cache } from "next/cache";

import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import GsapInit from "@/components/public/GsapInit";
import GsapCarousel from "@/components/public/GsapCarousel";
import ExperienceSection from "@/components/public/ExperienceSection";
import TransportSection from "@/components/public/TransportSection";
import BusinessCard from "@/components/public/BusinessCard";

const getHomepageData = unstable_cache(
  async () => {
    const [roomTypes, activities, tours, services, menuItems, gallery, testimonials, settings, featuredBusinesses] =
      await Promise.all([
        db.query.roomTypes.findMany({ with: { media: true } }),
        db.query.activities.findMany({
          where: (t, { eq }) => eq(t.isActive, true),
          with: { media: true },
        }),
        db.query.tours.findMany({
          where: (t, { eq }) => eq(t.isActive, true),
          with: { media: true },
        }),
        db.query.services.findMany({ where: (t, { eq }) => eq(t.isActive, true) }),
        db.query.menuItems.findMany({ where: (t, { eq }) => eq(t.isAvailable, true) }),
        db.query.media.findMany({ where: (t, { eq }) => eq(t.entityType, "gallery"), limit: 20 }),
        db.query.testimonials.findMany({
          where: (t, { and, eq }) => and(eq(t.isPublished, true), eq(t.reviewStatus, "approved")),
          orderBy: (t, { desc }) => [desc(t.isFeatured), desc(t.createdAt)],
          limit: 12,
        }),
        db.query.settings.findMany(),
        db.query.businesses.findMany({
          where: (t, { and, eq }) => and(eq(t.isActive, true), eq(t.isFeatured, true)),
          orderBy: (t, { asc }) => [asc(t.sortOrder)],
          with: { media: true },
          limit: 6,
        }),
      ]);
    return { roomTypes, activities, tours, services, menuItems, gallery, testimonials, settings, featuredBusinesses };
  },
  ["homepage-data"],
  { tags: ["homepage"], revalidate: 3600 }
);

export default async function HomePage() {
  const { roomTypes, activities, tours, services, menuItems, gallery, testimonials, settings, featuredBusinesses } =
    await getHomepageData();

  const heroImage   = settings.find(s => s.key === "hero_image_url")?.value;
  const aboutImage  = settings.find(s => s.key === "about_image_url")?.value  || "/images/hero.png";
  const diningImage = settings.find(s => s.key === "dining_image_url")?.value || "/images/hero.png";
  const instagram   = normalizeUrl(settings.find(s => s.key === "social_instagram_url")?.value || "");
  const facebook    = normalizeUrl(settings.find(s => s.key === "social_facebook_url")?.value  || "");
  const tiktok      = normalizeUrl(settings.find(s => s.key === "social_tiktok_url")?.value    || "");

  /* ─────────────────────────────────────────────────────────── */

  return (
    <main style={{ overflowX: "hidden" }}>
      <Navbar />
      <GsapInit />
      <Hero imageUrl={heroImage} />

      {/* ══ STATS BAR ══════════════════════════════════════════════ */}
      <div className="stats-bar" style={{ background: "var(--forest)", color: "#fff" }}>
        <div className="container" style={{ padding: "clamp(18px, 3vw, 28px) clamp(20px, 4vw, 48px)" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "clamp(16px, 3vw, 0px)",
          }}>
            {[
              { icon: "📍", label: "Atoll",   value: "Haa Alif" },
              { icon: "🌿", label: "Famous For", value: "Agriculture" },
              { icon: "🏖️", label: "Coastline", value: "Pristine Beaches" },
              { icon: "✈️", label: "Airport",  value: "Hanimaadhoo (HAQ)" },
            ].map(s => (
              <div key={s.label} className="stats-bar-item" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: "10px", opacity: 0.5, letterSpacing: "1.5px", textTransform: "uppercase" }}>{s.label}</div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 01 · DISCOVER ══════════════════════════════════════════ */}
      <section
        id="discover"
        style={{
          background: "var(--forest)",
          color: "#fff",
          padding: "clamp(80px, 12vw, 140px) 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ghost background number */}
        <div className="sec-num" style={{
          position: "absolute", top: "-2%", left: "-1%",
          fontSize: "clamp(140px, 22vw, 280px)",
          color: "rgba(255,255,255,0.03)",
          lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}>01</div>

        <div className="container" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(40px, 7vw, 96px)",
          alignItems: "center",
          position: "relative",
        }}>
          {/* Text side */}
          <div className="slide-in-left">
            <p className="overline" style={{ marginBottom: "20px" }}>The Island</p>

            <h2 style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              color: "#fff", lineHeight: 1.05, marginBottom: "28px",
              letterSpacing: "-0.5px",
            }}>
              Discover the<br />Heart of the North
            </h2>

            <div
              className="line-expand"
              style={{ width: "56px", height: "2px", background: "var(--gold)", marginBottom: "28px" }}
            />

            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px", lineHeight: 1.8, marginBottom: "20px" }}>
              Nestled in the northernmost reaches of the Maldives, HA. Baarah is a living tapestry
              of tradition, nature, and warm island hospitality. Far from the resort crowds, this
              is the Maldives as it has always been.
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", lineHeight: 1.8, marginBottom: "48px" }}>
              The island is renowned throughout the archipelago for its rich agricultural heritage —
              fertile soil yields fresh watermelons, papayas, and tropical fruit. Baarah&apos;s
              lagoon is a mirror of turquoise tranquillity.
            </p>

            {/* Stats row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
              paddingTop: "36px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}>
              {[
                { value: "1500", label: "Residents", suffix: "+" },
                { value: "4", label: "km of beaches", suffix: "" },
                { value: "100", label: "% authentic", suffix: "" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "var(--gold-light)" }}>
                    <span data-count={s.value}>0</span>{s.suffix}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "4px", letterSpacing: "0.5px" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image side */}
          <div className="slide-in-right" style={{ position: "relative" }}>
            <div
              className="parallax-wrap"
              style={{
                aspectRatio: "4/5",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="parallax-img"
                style={{ backgroundImage: `url(${aboutImage})` }}
              />
            </div>
            {/* Gold accent block */}
            <div style={{
              position: "absolute",
              bottom: "clamp(-20px, -3vw, -36px)",
              right: "clamp(-16px, -2.5vw, -36px)",
              width: "clamp(80px, 16vw, 140px)",
              height: "clamp(80px, 16vw, 140px)",
              background: "var(--gold)",
              borderRadius: "12px",
              opacity: 0.9,
              zIndex: -1,
            }} />
          </div>
        </div>

        {/* Responsive stack on mobile */}
        <style>{`
          @media (max-width: 760px) {
            #discover .container { grid-template-columns: 1fr !important; }
            #discover .slide-in-right { display: none; }
          }
        `}</style>
      </section>

      {/* ══ BUSINESSES ON BAARAH ═══════════════════════════════════ */}
      {featuredBusinesses.length > 0 && (
        <section style={{ background: "#fff", padding: "clamp(80px, 12vw, 140px) 0", overflow: "hidden" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "clamp(48px, 7vw, 72px)", flexWrap: "wrap", gap: "24px" }}>
              <div>
                <p className="overline s-up" style={{ marginBottom: "14px" }}>Island Directory</p>
                <h2 className="s-up" style={{ fontSize: "clamp(36px, 5vw, 60px)", letterSpacing: "-0.5px" }}>
                  Businesses on Baarah
                </h2>
              </div>
              <a href="/businesses" className="btn-outline-gold s-up" style={{ padding: "12px 28px", fontSize: "13px" }}>
                View All →
              </a>
            </div>
            <div className="stagger-row" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "clamp(16px, 2.5vw, 24px)",
            }}>
              {featuredBusinesses.map(biz => (
                <BusinessCard key={biz.id} {...biz as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 02 · EXPLORE ═══════════════════════════════════════════ */}
      {tours.length > 0 && (
        <section id="explore" style={{ background: "var(--cream)", padding: "clamp(80px, 12vw, 140px) 0", overflow: "hidden" }}>
          <div className="container">
            {/* Section header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "clamp(48px, 8vw, 80px)", flexWrap: "wrap", gap: "24px" }}>
              <div>
                <div className="sec-num sec-num-dark s-up" style={{ marginBottom: "-8px" }}>02</div>
                <p className="overline s-up" style={{ marginBottom: "14px" }}>Explore</p>
                <h2 className="s-up" style={{ fontSize: "clamp(36px, 5vw, 60px)", letterSpacing: "-0.5px" }}>
                  Nature &amp; Attractions
                </h2>
              </div>
              <p className="s-up" style={{ maxWidth: "360px", color: "var(--text-light)", fontSize: "15px", lineHeight: 1.75 }}>
                From secluded beaches to lush farmland — discover what makes Baarah unlike anywhere else in the Maldives.
              </p>
            </div>

            {/* Tall portrait card grid */}
            <div className="explore-grid stagger-row">
              {tours.map(tour => {
                const img = tour.media?.[0]?.url || "/images/hero.png";
                return (
                  <div
                    key={tour.id}
                    style={{
                      position: "relative",
                      height: "clamp(380px, 50vw, 520px)",
                      borderRadius: "14px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                    className="parallax-wrap"
                  >
                    <div
                      className="parallax-img"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                    {/* Gradient overlay */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(9,15,10,0.92) 0%, rgba(9,15,10,0.2) 50%, transparent 100%)",
                    }} />
                    {/* Text at bottom */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      padding: "clamp(20px, 3vw, 32px)",
                      color: "#fff",
                    }}>
                      {tour.duration && (
                        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.55, marginBottom: "8px" }}>
                          {tour.duration}
                        </div>
                      )}
                      <h3 style={{ fontSize: "clamp(18px, 2.5vw, 22px)", marginBottom: "8px", fontWeight: 700 }}>
                        {tour.name}
                      </h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: "13px", opacity: 0.6, lineHeight: 1.5, maxWidth: "200px" }}>
                          {tour.shortDescription || (tour.description || "").slice(0, 80)}
                        </p>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--gold-light)", whiteSpace: "nowrap", marginLeft: "12px" }}>
                          ${tour.price}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ 03 · EVENTS ════════════════════════════════════════════ */}
      {activities.length > 0 && (
        <section id="events" style={{ background: "#fff" }}>
          {/* Section heading */}
          <div className="container" style={{ paddingTop: "clamp(80px, 12vw, 140px)", paddingBottom: "clamp(48px, 7vw, 80px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
              <div>
                <div className="sec-num sec-num-dark s-up" style={{ marginBottom: "-8px" }}>03</div>
                <p className="overline s-up" style={{ marginBottom: "14px" }}>Events</p>
                <h2 className="s-up" style={{ fontSize: "clamp(36px, 5vw, 60px)", letterSpacing: "-0.5px" }}>
                  What&apos;s On in Baarah
                </h2>
              </div>
              <p className="s-up" style={{ maxWidth: "360px", color: "var(--text-light)", fontSize: "15px", lineHeight: 1.75 }}>
                Cultural celebrations, sports events, and community gatherings — the island is always alive.
              </p>
            </div>
          </div>

          {/* Alternating full-width event strips */}
          {activities.map((activity, idx) => {
            const img = activity.media?.[0]?.url || "/images/hero.png";
            const isEven = idx % 2 === 1;
            return (
              <div key={activity.id} className={`event-row${isEven ? " reversed" : ""}`}>
                {/* Image panel */}
                <div className="event-img-panel parallax-wrap">
                  <div
                    className="parallax-img"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                </div>
                {/* Text panel */}
                <div className="event-text-panel s-up">
                  <div style={{
                    fontSize: "clamp(48px, 8vw, 80px)",
                    fontWeight: 900,
                    color: isEven ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.04)",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <p className="overline" style={{ marginBottom: "12px" }}>Event</p>
                  <h3 style={{ fontSize: "clamp(22px, 3vw, 34px)", marginBottom: "16px", letterSpacing: "-0.3px" }}>
                    {activity.name}
                  </h3>
                  <p style={{ color: "var(--text-light)", fontSize: "15px", lineHeight: 1.75, marginBottom: "28px" }}>
                    {activity.shortDescription || activity.description}
                  </p>
                  {activity.price && (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "var(--green)",
                      color: "#fff",
                      padding: "8px 18px",
                      borderRadius: "100px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}>
                      ${activity.price}
                      <span style={{ opacity: 0.65 }}>/ {activity.priceUnit?.replace("_", " ")}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ══ WHERE TO STAY ═══════════════════════════════════════════ */}
      {roomTypes.length > 0 && (
        <section id="stay" style={{ background: "var(--cream)", padding: "clamp(80px, 12vw, 140px) 0", overflow: "hidden" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "clamp(48px, 8vw, 80px)" }}>
              <p className="overline s-up" style={{ marginBottom: "14px" }}>Where to Stay</p>
              <h2 className="s-up" style={{ fontSize: "clamp(36px, 5vw, 60px)", letterSpacing: "-0.5px", marginBottom: "16px" }}>
                Accommodation on Baarah
              </h2>
              <p className="s-up" style={{ color: "var(--text-light)", maxWidth: "480px", margin: "0 auto", fontSize: "15px", lineHeight: 1.75 }}>
                Cosy guesthouses and beachfront stays — rest well after a day of exploration.
              </p>
            </div>
            <div className="stagger-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "clamp(20px, 2.5vw, 28px)" }}>
              {roomTypes.map(rt => {
                const img = rt.media?.[0]?.url || "/images/hero.png";
                return (
                  <div key={rt.id} style={{ borderRadius: "14px", overflow: "hidden", background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                    <div
                      className="parallax-wrap"
                      style={{ height: "240px" }}
                    >
                      <div className="parallax-img" style={{ backgroundImage: `url(${img})` }} />
                    </div>
                    <div style={{ padding: "clamp(20px, 3vw, 28px)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>{rt.name}</h3>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--green)" }}>${rt.basePrice}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-light)" }}>/ night</div>
                        </div>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-light)", lineHeight: 1.65, marginBottom: "20px" }}>{rt.description}</p>
                      <a href="mailto:info@visitbaarah.mv" className="btn-luxury" style={{ width: "100%", textAlign: "center", fontSize: "13px", padding: "12px" }}>
                        Enquire
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ 04 · GETTING AROUND ════════════════════════════════════ */}
      <TransportSection services={services} />

      {/* ══ 05 · DINING + GALLERY ══════════════════════════════════ */}
      <ExperienceSection menuItems={menuItems} gallery={gallery} diningImageUrl={diningImage} />

      {/* ══ GALLERY (if no dining but gallery exists — fallback) ═══ */}
      {(!menuItems.length && gallery.length > 0) && (
        <section id="gallery" style={{ background: "#fff", padding: "clamp(80px, 12vw, 140px) 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "clamp(48px, 8vw, 72px)" }}>
              <p className="overline s-up" style={{ marginBottom: "14px" }}>Gallery</p>
              <h2 className="s-up" style={{ fontSize: "clamp(36px, 5vw, 60px)", letterSpacing: "-0.5px" }}>
                Baarah in Photos
              </h2>
            </div>
            <div className="gallery-masonry">
              {gallery.map(item => (
                <div key={item.id} className="gallery-masonry-item reveal-img">
                  <img src={item.url} alt={item.alt || "Baarah"} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ REVIEWS ═════════════════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section
          id="reviews"
          style={{
            background: "var(--forest)",
            color: "#fff",
            padding: "clamp(80px, 12vw, 140px) 0",
            overflow: "hidden",
          }}
        >
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "clamp(48px, 8vw, 72px)" }}>
              <p className="overline s-up" style={{ marginBottom: "14px" }}>Visitors Say</p>
              <h2 className="s-up" style={{ fontSize: "clamp(36px, 5vw, 60px)", color: "#fff", letterSpacing: "-0.5px" }}>
                Stories from Baarah
              </h2>
            </div>

            <GsapCarousel autoPlay interval={7500} showArrows showDots>
              {testimonials.map(item => (
                <div key={item.id} style={{ padding: "0 clamp(8px, 3vw, 32px)" }}>
                  <div style={{
                    maxWidth: "820px",
                    margin: "0 auto",
                    textAlign: "center",
                    padding: "clamp(32px, 5vw, 64px)",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <div style={{ color: "var(--gold)", fontSize: "22px", letterSpacing: "4px", marginBottom: "32px" }}>
                      {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                    </div>
                    <p style={{
                      fontSize: "clamp(18px, 2.5vw, 24px)",
                      fontStyle: "italic",
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,0.88)",
                      marginBottom: "40px",
                    }}>
                      &ldquo;{item.content}&rdquo;
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "48px", height: "48px",
                        background: "var(--green)",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: "18px",
                      }}>
                        {item.guestName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "15px" }}>{item.guestName}</div>
                        <div style={{ fontSize: "12px", opacity: 0.45, letterSpacing: "1.5px" }}>
                          {item.guestCountry?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </GsapCarousel>
          </div>
        </section>
      )}

      {/* ══ PLAN YOUR VISIT CTA ════════════════════════════════════ */}
      <section style={{ background: "var(--cream)", padding: "clamp(80px, 12vw, 140px) 0", overflow: "hidden", position: "relative" }}>
        {/* Giant ghost text */}
        <div style={{
          position: "absolute",
          bottom: "-8%",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "clamp(60px, 14vw, 180px)",
          fontWeight: 900,
          color: "rgba(0,0,0,0.03)",
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
        }}>
          BAARAH
        </div>

        <div className="container" style={{ textAlign: "center", position: "relative" }}>
          <div className="s-up">
            <p className="overline" style={{ marginBottom: "20px" }}>Ready to Visit?</p>
            <h2 style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              letterSpacing: "-1px",
              marginBottom: "20px",
              lineHeight: 1.05,
            }}>
              Plan Your Trip<br />
              <span style={{ color: "var(--green)" }}>to Baarah</span>
            </h2>
            <p style={{
              color: "var(--text-light)",
              maxWidth: "500px",
              margin: "0 auto 44px",
              fontSize: "16px",
              lineHeight: 1.75,
            }}>
              Have questions about getting here, things to do, or where to stay? Reach out — we&apos;re here to help you plan the perfect Baarah experience.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
              <a href="mailto:info@visitbaarah.mv" className="btn-luxury" style={{ padding: "16px 44px", fontSize: "14px" }}>
                Get in Touch
              </a>
              <a href="#transport" className="btn-outline-gold" style={{ padding: "15px 44px", fontSize: "14px" }}>
                Getting Around
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════ */}
      <footer style={{ background: "var(--deep)", color: "#fff", padding: "clamp(64px, 10vw, 96px) 0 36px" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "clamp(28px, 4vw, 64px)",
            marginBottom: "clamp(48px, 8vw, 72px)",
          }}>
            <div>
              <h2 style={{
                color: "#fff", marginBottom: "16px",
                fontSize: "clamp(18px, 2.5vw, 24px)",
                fontWeight: 900, letterSpacing: "-0.5px",
              }}>
                VISIT BAARAH
              </h2>
              <p style={{ opacity: 0.45, fontSize: "14px", lineHeight: 1.8, maxWidth: "280px" }}>
                Your guide to HA. Baarah — the authentic heart of the northern Maldives.
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                {[
                  { label: "Instagram", href: instagram, icon: "ig" as const },
                  { label: "Facebook",  href: facebook,  icon: "fb" as const },
                  { label: "TikTok",    href: tiktok,    icon: "tt" as const },
                ].map(s => (
                  <a
                    key={s.label}
                    href={s.href || "#"}
                    target={s.href ? "_blank" : undefined}
                    rel={s.href ? "noopener noreferrer" : undefined}
                    aria-label={s.label}
                    style={{
                      width: "36px", height: "36px",
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: "8px",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", textDecoration: "none",
                      opacity: s.href ? 1 : 0.3,
                      transition: "background 0.2s",
                    }}
                  >
                    <SocialIcon kind={s.icon} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: "20px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.35, fontWeight: 700 }}>
                Discover
              </h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                {[
                  { href: "#discover", label: "The Island" },
                  { href: "#explore",  label: "Nature" },
                  { href: "#events",   label: "Events" },
                  { href: "#dining",   label: "Dining" },
                ].map(l => (
                  <a key={l.href} href={l.href} style={{ color: "#fff", opacity: 0.5, textDecoration: "none", transition: "opacity 0.2s" }}>
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <h4 style={{ marginBottom: "20px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.35, fontWeight: 700 }}>
                Visit
              </h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                {[
                  { href: "#transport", label: "Getting Around" },
                  { href: "#stay",      label: "Where to Stay" },
                  { href: "#gallery",   label: "Gallery" },
                  { href: "#reviews",   label: "Reviews" },
                ].map(l => (
                  <a key={l.href} href={l.href} style={{ color: "#fff", opacity: 0.5, textDecoration: "none", transition: "opacity 0.2s" }}>
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <h4 style={{ marginBottom: "20px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.35, fontWeight: 700 }}>
                Contact
              </h4>
              <p style={{ fontSize: "14px", opacity: 0.5, lineHeight: 2 }}>
                HA. Baarah<br />
                Haa Alif Atoll<br />
                Maldives<br />
                info@visitbaarah.mv
              </p>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "12px",
            opacity: 0.3,
          }}>
            <span>&copy; {new Date().getFullYear()} Visit Baarah. All rights reserved.</span>
            <span>HA. Baarah · Haa Alif Atoll · Maldives</span>
          </div>
        </div>

        <style>{`
          @media (max-width: 760px) {
            footer .container > div:first-child {
              grid-template-columns: 1fr 1fr !important;
            }
          }
          @media (max-width: 480px) {
            footer .container > div:first-child {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </footer>
    </main>
  );
}

/* ─── helpers ──────────────────────────────────────────────── */

function normalizeUrl(url: string) {
  const t = url.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function SocialIcon({ kind }: { kind: "ig" | "fb" | "tt" }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "ig") return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  if (kind === "fb") return <svg {...p}><path d="M14 8h3V4h-3c-2.2 0-4 1.8-4 4v3H7v4h3v5h4v-5h3l1-4h-4V8c0-.6.4-1 1-1z" /></svg>;
  return <svg {...p}><path d="M14 4c.7 1.8 2.1 3 4 3.5V11c-1.4 0-2.7-.4-4-1.3V16a5 5 0 1 1-5-5c.3 0 .7 0 1 .1V14a2 2 0 1 0 1 1.7V4h3z" /></svg>;
}
