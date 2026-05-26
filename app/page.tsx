import { Fragment } from "react";
import { db } from "@/db";
import { unstable_cache } from "next/cache";

import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import GsapInit from "@/components/public/GsapInit";
import GsapCarousel from "@/components/public/GsapCarousel";
import ExperienceSection from "@/components/public/ExperienceSection";
import TransportSection from "@/components/public/TransportSection";
import NatureSection from "@/components/public/NatureSection";
import HeritageSection from "@/components/public/HeritageSection";
import BusinessCard from "@/components/public/BusinessCard";

const getHomepageData = unstable_cache(
  async () => {
    const [activities, tours, services, menuItems, gallery, testimonials, settings, featuredBusinesses] =
      await Promise.all([
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
    return { activities, tours, services, menuItems, gallery, testimonials, settings, featuredBusinesses };
  },
  ["homepage-data"],
  { tags: ["homepage"], revalidate: 3600 }
);

export default async function HomePage() {
  const { activities, tours, services, menuItems, gallery, testimonials, settings, featuredBusinesses } =
    await getHomepageData();

  const heroImage   = settings.find(s => s.key === "hero_image_url")?.value;
  const aboutImage  = settings.find(s => s.key === "about_image_url")?.value  || "/images/hero.png";
  const diningImage = settings.find(s => s.key === "dining_image_url")?.value || "/images/hero.png";
  const instagram   = normalizeUrl(settings.find(s => s.key === "social_instagram_url")?.value || "");
  const facebook    = normalizeUrl(settings.find(s => s.key === "social_facebook_url")?.value  || "");
  const tiktok      = normalizeUrl(settings.find(s => s.key === "social_tiktok_url")?.value    || "");

  return (
    <main style={{ overflowX: "hidden" }}>
      <Navbar />
      <GsapInit />
      <Hero imageUrl={heroImage} />

      {/* ══ STATS BAR ══════════════════════════════════════════════ */}
      <div className="stats-bar">
        <div className="container">
          <div className="stats-bar-row">
            {[
              { label: "From Malé",   value: "294 km" },
              { label: "From HAQ Airport", value: "45 min" },
              { label: "Mangrove Forest", value: "39 ha" },
              { label: "Liberation Year", value: "1573" },
            ].map((s, i) => (
              <Fragment key={s.label}>
                {i > 0 && <div className="stats-divider" aria-hidden="true" />}
                <div className="stats-bar-item">
                  <div className="stats-bar-label">{s.label}</div>
                  <div className="stats-bar-value">{s.value}</div>
                </div>
              </Fragment>
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
        <div className="sec-num" style={{
          position: "absolute", top: "-2%", left: "-1%",
          color: "rgba(255,255,255,0.03)",
          lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }} aria-hidden="true">01</div>

        <div
          className="container discover-inner"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(40px, 7vw, 96px)",
            alignItems: "center",
            position: "relative",
          }}
        >
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
            <div className="line-expand" style={{ width: "48px", height: "2px", background: "var(--gold)", marginBottom: "28px" }} />
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px", lineHeight: 1.8, marginBottom: "20px" }}>
              Nestled in the northernmost reaches of the Maldives, HA. Baarah is a place of
              remarkable nature, deep history, and unhurried island life. Far from the resort
              crowds, this is the Maldives as it has always been.
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", lineHeight: 1.8, marginBottom: "48px" }}>
              Home to the largest mangrove forest in the Maldives, a world-class reef at Baarah
              Corner, and the mangroves that sheltered the ship that freed a nation in 1573 —
              Baarah carries more history and natural wealth than its size suggests.
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
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px", letterSpacing: "0.5px" }}>
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
              <div className="parallax-img" style={{ backgroundImage: `url(${aboutImage})` }} />
            </div>
            {/* Gold accent */}
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
            }} aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ══ 02 · NATURAL HERITAGE ══════════════════════════════════ */}
      <NatureSection />

      {/* ══ 03 · LIVING HISTORY ════════════════════════════════════ */}
      <HeritageSection />

      {/* ══ ISLAND DIRECTORY ═══════════════════════════════════════ */}
      {featuredBusinesses.length > 0 && (
        <section style={{ background: "#fff", padding: "clamp(80px, 12vw, 140px) 0", overflow: "hidden" }}>
          <div className="container">
            <div className="sec-head-split">
              <div>
                <p className="overline s-up" style={{ marginBottom: "14px" }}>Island Directory</p>
                <h2 className="s-up" style={{ fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: "-0.5px", marginBottom: "12px" }}>
                  Businesses on Baarah
                </h2>
                <p className="s-up" style={{ color: "var(--text-light)", fontSize: "15px", maxWidth: "420px", lineHeight: 1.75 }}>
                  From guesthouses to guided tours — everything the island has to offer, curated.
                </p>
              </div>
              <a href="/businesses" className="link-arrow s-up" style={{ alignSelf: "flex-end", paddingBottom: "4px" }}>
                Explore full directory
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            {/* Category indicators */}
            <div className="cat-pills s-up">
              {["Stay", "Eat & Drink", "Transport", "Guided Tours", "Diving & Water Sports"].map(cat => (
                <span key={cat} className="cat-pill">{cat}</span>
              ))}
              <a href="/businesses" className="cat-pill" style={{ borderColor: "var(--gold)", color: "var(--gold)", cursor: "pointer" }}>
                + More →
              </a>
            </div>

            <div className="biz-grid stagger-row" style={{ isolation: "isolate" }}>
              {featuredBusinesses.map(biz => (
                <BusinessCard key={biz.id} {...biz as any} />
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "clamp(40px, 6vw, 64px)" }}>
              <a href="/businesses" className="btn-outline-gold" style={{ padding: "14px 40px", fontSize: "13px" }}>
                View All Listings
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ══ 02 · EXPLORE ═══════════════════════════════════════════ */}
      {tours.length > 0 && (
        <section id="explore" style={{ background: "var(--cream)", padding: "clamp(80px, 12vw, 140px) 0", overflow: "hidden" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "clamp(48px, 8vw, 80px)", flexWrap: "wrap", gap: "24px" }}>
              <div>
                <div className="sec-num sec-num-dark s-up" style={{ marginBottom: "-8px" }}>02</div>
                <p className="overline s-up" style={{ marginBottom: "14px" }}>Explore</p>
                <h2 className="s-up" style={{ fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: "-0.5px" }}>
                  Nature &amp; Attractions
                </h2>
              </div>
              <p className="s-up" style={{ maxWidth: "360px", color: "var(--text-light)", fontSize: "15px", lineHeight: 1.75 }}>
                From secluded beaches to lush farmland — discover what makes Baarah unlike anywhere else in the Maldives.
              </p>
            </div>

            <div className="explore-grid stagger-row">
              {tours.map(tour => {
                const img = tour.media?.[0]?.url || "/images/hero.png";
                return (
                  <div
                    key={tour.id}
                    className="parallax-wrap"
                    style={{
                      position: "relative",
                      height: "clamp(380px, 50vw, 520px)",
                      borderRadius: "14px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <div className="parallax-img" style={{ backgroundImage: `url(${img})` }} />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(9,15,10,0.92) 0%, rgba(9,15,10,0.15) 55%, transparent 100%)",
                    }} />
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      padding: "clamp(20px, 3vw, 32px)",
                      color: "#fff",
                    }}>
                      {tour.duration && (
                        <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.5, marginBottom: "8px" }}>
                          {tour.duration}
                        </div>
                      )}
                      <h3 style={{ fontSize: "clamp(17px, 2.5vw, 22px)", marginBottom: "8px", fontWeight: 700 }}>
                        {tour.name}
                      </h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                        <p style={{ fontSize: "13px", opacity: 0.55, lineHeight: 1.5, maxWidth: "200px" }}>
                          {tour.shortDescription || (tour.description || "").slice(0, 80)}
                        </p>
                        {Number(tour.price) > 0 && (
                          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--gold-light)", whiteSpace: "nowrap" }}>
                            ${tour.price}
                          </span>
                        )}
                        {Number(tour.price) === 0 && (
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--gold-light)", whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
                            Free
                          </span>
                        )}
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
          <div className="container" style={{ paddingTop: "clamp(80px, 12vw, 140px)", paddingBottom: "clamp(48px, 7vw, 80px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
              <div>
                <div className="sec-num sec-num-dark s-up" style={{ marginBottom: "-8px" }}>03</div>
                <p className="overline s-up" style={{ marginBottom: "14px" }}>Events</p>
                <h2 className="s-up" style={{ fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: "-0.5px" }}>
                  What&apos;s On in Baarah
                </h2>
              </div>
              <p className="s-up" style={{ maxWidth: "360px", color: "var(--text-light)", fontSize: "15px", lineHeight: 1.75 }}>
                Cultural celebrations, sports events, and community gatherings — the island is always alive.
              </p>
            </div>
          </div>

          {activities.map((activity, idx) => {
            const img = activity.media?.[0]?.url || "/images/hero.png";
            const isEven = idx % 2 === 1;
            return (
              <div key={activity.id} className={`event-row${isEven ? " reversed" : ""}`}>
                <div className="event-img-panel parallax-wrap">
                  <div className="parallax-img" style={{ backgroundImage: `url(${img})` }} />
                </div>
                <div className="event-text-panel s-up">
                  <div style={{
                    fontSize: "clamp(48px, 8vw, 80px)",
                    fontWeight: 900,
                    color: "rgba(0,0,0,0.04)",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }} aria-hidden="true">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <p className="overline" style={{ marginBottom: "12px" }}>Event</p>
                  <h3 style={{ fontSize: "clamp(22px, 3vw, 34px)", marginBottom: "16px", letterSpacing: "-0.3px" }}>
                    {activity.name}
                  </h3>
                  <p style={{ color: "var(--text-light)", fontSize: "15px", lineHeight: 1.75, marginBottom: "28px" }}>
                    {activity.shortDescription || activity.description}
                  </p>
                  {Number(activity.price) > 0 && (
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
                  {Number(activity.price) === 0 && (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "transparent",
                      color: "var(--green)",
                      padding: "8px 0",
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                    }}>
                      Free to attend
                    </div>
                  )}
                  {activity.duration && (
                    <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-light)", letterSpacing: "0.5px" }}>
                      {activity.duration}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ══ GETTING AROUND ═════════════════════════════════════════ */}
      <TransportSection services={services} />

      {/* ══ 05 · DINING + GALLERY ══════════════════════════════════ */}
      <ExperienceSection menuItems={menuItems} gallery={gallery} diningImageUrl={diningImage} />

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
              <h2 className="s-up" style={{ fontSize: "clamp(32px, 5vw, 56px)", color: "#fff", letterSpacing: "-0.5px" }}>
                Stories from Baarah
              </h2>
            </div>

            <GsapCarousel autoPlay interval={7500} showArrows showDots>
              {testimonials.map(item => (
                <div key={item.id} style={{ padding: "0 clamp(8px, 3vw, 32px)" }}>
                  <div style={{
                    maxWidth: "780px",
                    margin: "0 auto",
                    textAlign: "center",
                    padding: "clamp(32px, 5vw, 64px)",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <div style={{ color: "var(--gold)", fontSize: "18px", letterSpacing: "4px", marginBottom: "32px" }}>
                      {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                    </div>
                    <p style={{
                      fontSize: "clamp(17px, 2.5vw, 22px)",
                      fontStyle: "italic",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.85)",
                      marginBottom: "40px",
                      fontWeight: 300,
                    }}>
                      &ldquo;{item.content}&rdquo;
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "44px", height: "44px",
                        background: "var(--green)",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: "17px",
                      }}>
                        {item.guestName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>{item.guestName}</div>
                        <div style={{ fontSize: "11px", opacity: 0.4, letterSpacing: "2px", textTransform: "uppercase", marginTop: "3px" }}>
                          {item.guestCountry}
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
        }} aria-hidden="true">BAARAH</div>

        <div className="container" style={{ textAlign: "center", position: "relative" }}>
          <div className="s-up">
            <p className="overline" style={{ marginBottom: "20px" }}>Ready to Visit?</p>
            <h2 style={{
              fontSize: "clamp(32px, 6vw, 68px)",
              letterSpacing: "-1px",
              marginBottom: "20px",
              lineHeight: 1.05,
            }}>
              Plan Your Trip<br />
              <span style={{ color: "var(--green)" }}>to Baarah</span>
            </h2>
            <p style={{
              color: "var(--text-light)",
              maxWidth: "480px",
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
          <div className="footer-grid" style={{ marginBottom: "clamp(48px, 8vw, 72px)" }}>
            <div>
              <h2 style={{
                color: "#fff", marginBottom: "16px",
                fontSize: "clamp(17px, 2.5vw, 22px)",
                fontWeight: 900, letterSpacing: "-0.5px",
              }}>
                VISIT BAARAH
              </h2>
              <p style={{ opacity: 0.4, fontSize: "14px", lineHeight: 1.8, maxWidth: "260px" }}>
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
                      opacity: s.href ? 1 : 0.25,
                      transition: "background 0.2s, opacity 0.2s",
                    }}
                  >
                    <SocialIcon kind={s.icon} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: "20px", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.3, fontWeight: 700 }}>
                Discover
              </h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                {[
                  { href: "#discover",  label: "The Island" },
                  { href: "#nature",    label: "Natural Heritage" },
                  { href: "#heritage",  label: "History" },
                  { href: "#events",    label: "Events" },
                ].map(l => (
                  <a key={l.href} href={l.href} style={{ color: "#fff", opacity: 0.45, textDecoration: "none", transition: "opacity 0.2s" }}>
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <h4 style={{ marginBottom: "20px", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.3, fontWeight: 700 }}>
                Visit
              </h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                {[
                  { href: "#transport",  label: "Getting Around" },
                  { href: "/businesses", label: "Island Directory" },
                  { href: "#explore",    label: "Tours" },
                  { href: "#reviews",    label: "Reviews" },
                ].map(l => (
                  <a key={l.href} href={l.href} style={{ color: "#fff", opacity: 0.45, textDecoration: "none", transition: "opacity 0.2s" }}>
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <h4 style={{ marginBottom: "20px", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.3, fontWeight: 700 }}>
                Contact
              </h4>
              <p style={{ fontSize: "14px", opacity: 0.45, lineHeight: 2 }}>
                HA. Baarah<br />
                Haa Alif Atoll<br />
                Maldives<br />
                <a href="mailto:info@visitbaarah.mv" style={{ color: "#fff", opacity: 1, textDecoration: "none" }}>
                  info@visitbaarah.mv
                </a>
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
            opacity: 0.28,
          }}>
            <span>&copy; {new Date().getFullYear()} Visit Baarah. All rights reserved.</span>
            <span>HA. Baarah · Haa Alif Atoll · Maldives</span>
          </div>
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "10px", opacity: 0.18, letterSpacing: "0.3px" }}>
            Built & maintained by Ahmed Saamih &middot; <a href="mailto:saamme619@gmail.com" style={{ color: "inherit", textDecoration: "none" }}>saamme619@gmail.com</a>
          </div>
        </div>
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
