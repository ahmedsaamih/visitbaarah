import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import Navbar from "@/components/public/Navbar";
import BusinessDirectoryClient from "@/components/public/BusinessDirectoryClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Businesses on Baarah | Visit Baarah",
  description: "Discover guesthouses, restaurants, transport, tour guides, and local businesses on HA. Baarah, Maldives.",
  alternates: { canonical: "/businesses" },
};

export default async function BusinessesPage() {
  const items = await db.query.businesses.findMany({
    where: eq(businesses.isActive, true),
    orderBy: [asc(businesses.sortOrder), asc(businesses.name)],
    with: { media: true },
  });

  return (
    <main style={{ overflowX: "hidden" }}>
      <Navbar />

      {/* Page hero */}
      <section style={{
        background: "var(--forest)",
        color: "#fff",
        paddingTop: "clamp(110px, 16vw, 160px)",
        paddingBottom: "clamp(56px, 9vw, 96px)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ghost background text */}
        <div style={{
          position: "absolute", top: "-4%", right: "-2%",
          fontSize: "clamp(120px, 20vw, 260px)",
          fontWeight: 900, lineHeight: 1,
          color: "rgba(255,255,255,0.025)",
          userSelect: "none", pointerEvents: "none",
        }} aria-hidden="true">DIR</div>

        <div className="container" style={{ position: "relative" }}>
          <a href="/" className="dir-back-link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M11.5 7H2.5M6 3.5L2.5 7 6 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Visit Baarah
          </a>

          <p className="overline" style={{ marginBottom: "16px", marginTop: "24px" }}>Island Directory</p>
          <h1 style={{
            fontSize: "clamp(32px, 5.5vw, 64px)",
            fontWeight: 900,
            letterSpacing: "-1px",
            lineHeight: 1.05,
            color: "#fff",
            marginBottom: "18px",
          }}>
            Businesses on Baarah
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", maxWidth: "440px", lineHeight: 1.8 }}>
            Guesthouses, restaurants, transport, tour guides, and everything the island has to offer — in one place.
          </p>
        </div>
      </section>

      {/* Directory listing */}
      <section style={{ background: "var(--cream)", padding: "clamp(56px, 9vw, 96px) 0", minHeight: "40vh" }}>
        <div className="container">
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontSize: "16px", color: "var(--text-light)", lineHeight: 1.7 }}>
                No listings yet — check back soon.
              </p>
              <a href="/" className="link-arrow" style={{ marginTop: "24px", display: "inline-flex", color: "var(--gold)" }}>
                Back to home
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          ) : (
            <BusinessDirectoryClient businesses={items as any} />
          )}
        </div>
      </section>

      {/* Footer strip */}
      <div style={{ background: "var(--deep)", padding: "clamp(48px, 7vw, 72px) 0 28px" }}>
        <div className="container">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            paddingBottom: "28px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            marginBottom: "28px",
          }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: "16px", color: "#fff", letterSpacing: "-0.3px", marginBottom: "6px" }}>
                VISIT BAARAH
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                Your guide to HA. Baarah, Haa Alif Atoll, Maldives.
              </p>
            </div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {[
                { href: "/", label: "Home" },
                { href: "/#explore", label: "Explore" },
                { href: "/#events", label: "Events" },
                { href: "mailto:info@visitbaarah.mv", label: "Contact" },
              ].map(l => (
                <a key={l.href} href={l.href} style={{
                  color: "rgba(255,255,255,0.38)",
                  fontSize: "13px",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
              &copy; {new Date().getFullYear()} Visit Baarah
            </span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
              HA. Baarah · Haa Alif Atoll · Maldives
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
