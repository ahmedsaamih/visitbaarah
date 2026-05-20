import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import Navbar from "@/components/public/Navbar";
import BusinessDirectoryClient from "@/components/public/BusinessDirectoryClient";
import type { Metadata } from "next";

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
        paddingTop: "clamp(120px, 18vw, 180px)",
        paddingBottom: "clamp(60px, 10vw, 100px)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-4%", right: "-2%",
          fontSize: "clamp(120px, 20vw, 260px)",
          fontWeight: 900, lineHeight: 1,
          color: "rgba(255,255,255,0.025)",
          userSelect: "none", pointerEvents: "none",
        }}>
          DIR
        </div>
        <div className="container" style={{ position: "relative" }}>
          <p className="overline" style={{ marginBottom: "16px" }}>Island Directory</p>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 900,
            letterSpacing: "-1px",
            lineHeight: 1.05,
            color: "#fff",
            marginBottom: "20px",
          }}>
            Businesses on Baarah
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "16px", maxWidth: "480px", lineHeight: 1.75 }}>
            Guesthouses, restaurants, transport operators, tour guides, and everything else the island has to offer.
          </p>
        </div>
      </section>

      {/* Directory */}
      <section style={{ background: "var(--cream)", padding: "clamp(64px, 10vw, 100px) 0" }}>
        <div className="container">
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontSize: "18px", color: "var(--text-light)" }}>
                No listings yet — check back soon.
              </p>
            </div>
          ) : (
            <BusinessDirectoryClient businesses={items as any} />
          )}
        </div>
      </section>

      {/* Footer back link */}
      <div style={{ background: "var(--deep)", padding: "28px 0", textAlign: "center" }}>
        <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
          ← Back to Visit Baarah
        </a>
      </div>
    </main>
  );
}
