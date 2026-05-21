import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import ConnectViaButton from "@/components/public/ConnectViaButton";
import InquiryForm from "@/components/public/InquiryForm";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }>; }

const TYPE_LABELS: Record<string, string> = {
  guesthouse: "Guesthouse",
  restaurant: "Restaurant",
  cafe: "Café",
  transport: "Transport",
  tour_guide: "Tour Guide",
  dive_shop: "Dive Shop",
  grocery: "Grocery",
  spa: "Spa",
  other: "Local Business",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const biz = await db.query.businesses.findFirst({ where: eq(businesses.slug, slug) });
  if (!biz) return {};
  return {
    title: `${biz.name} | Visit Baarah`,
    description: biz.shortDescription || biz.description || `${biz.name} on HA. Baarah, Maldives.`,
    alternates: { canonical: `/businesses/${slug}` },
  };
}

export default async function BusinessDetailPage({ params }: Props) {
  const { slug } = await params;

  const biz = await db.query.businesses.findFirst({
    where: eq(businesses.slug, slug),
    with: { media: true },
  });

  if (!biz || !biz.isActive) notFound();

  const connectLinks = (biz.connectLinks || []) as { type: string; value: string }[];
  const heroImg = biz.coverPhotoUrl || biz.media?.[0]?.url || "/images/hero.png";
  const galleryImages = biz.media?.filter((m) => m.url !== biz.coverPhotoUrl) || [];
  const typeLabel = TYPE_LABELS[biz.businessType] || "Business";

  return (
    <main style={{ overflowX: "hidden" }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        height: "55vh",
        minHeight: "380px",
        position: "relative",
        overflow: "hidden",
        color: "#fff",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(9,15,10,0.35) 0%, rgba(9,15,10,0.7) 100%)",
        }} />
        <div className="container" style={{
          position: "relative", zIndex: 1,
          height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          paddingBottom: "clamp(32px, 5vw, 56px)",
          paddingTop: "100px",
        }}>
          <div style={{
            display: "inline-block",
            background: "var(--gold)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            padding: "5px 12px",
            borderRadius: "100px",
            marginBottom: "16px",
            alignSelf: "flex-start",
          }}>
            {typeLabel}
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.5px",
            marginBottom: "16px",
            color: "#fff",
          }}>
            {biz.name}
          </h1>
          {connectLinks.length > 0 && <ConnectViaButton links={connectLinks} />}
        </div>
      </section>

      {/* Main content */}
      <section style={{ background: "var(--cream)", padding: "clamp(48px, 8vw, 96px) 0" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "clamp(36px, 6vw, 80px)",
            alignItems: "start",
          }}>
            {/* Left: about + gallery */}
            <div>
              {biz.description && (
                <div style={{ marginBottom: "clamp(40px, 6vw, 64px)" }}>
                  <p className="overline" style={{ marginBottom: "16px" }}>About</p>
                  <p style={{ fontSize: "16px", color: "var(--text-mid)", lineHeight: 1.8, maxWidth: "600px" }}>
                    {biz.description}
                  </p>
                </div>
              )}

              {galleryImages.length > 0 && (
                <div>
                  <p className="overline" style={{ marginBottom: "20px" }}>Gallery</p>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "12px",
                  }}>
                    {galleryImages.map((m) => (
                      <div key={m.url} style={{
                        aspectRatio: "4/3",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}>
                        <img
                          src={m.url}
                          alt={biz.name}
                          loading="lazy"
                          className="biz-gallery-img"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 350ms cubic-bezier(0.23,1,0.32,1)" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: contact card + inquiry form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {/* Contact info */}
              {(biz.contactPhone || biz.contactEmail || biz.address) && (
                <div style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "clamp(20px, 3vw, 28px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                }}>
                  <p className="overline" style={{ marginBottom: "16px" }}>Contact</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "var(--text-mid)" }}>
                    {biz.address && (
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <span style={{ opacity: 0.5, flexShrink: 0 }}>📍</span>
                        <span>{biz.address}</span>
                      </div>
                    )}
                    {biz.contactPhone && (
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ opacity: 0.5, flexShrink: 0 }}>📞</span>
                        <a href={`tel:${biz.contactPhone}`} style={{ color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>
                          {biz.contactPhone}
                        </a>
                      </div>
                    )}
                    {biz.contactEmail && (
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ opacity: 0.5, flexShrink: 0 }}>✉️</span>
                        <a href={`mailto:${biz.contactEmail}`} style={{ color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>
                          {biz.contactEmail}
                        </a>
                      </div>
                    )}
                  </div>
                  {connectLinks.length > 0 && (
                    <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                      <ConnectViaButton links={connectLinks} />
                    </div>
                  )}
                </div>
              )}

              {/* Inquiry form */}
              <div style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "clamp(20px, 3vw, 28px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}>
                <p className="overline" style={{ marginBottom: "8px" }}>Get in touch</p>
                <h2 style={{ fontSize: "20px", marginBottom: "24px", letterSpacing: "-0.3px" }}>
                  Send a message
                </h2>
                <InquiryForm businessId={biz.id} businessName={biz.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div style={{ background: "var(--deep)", padding: "28px 0", textAlign: "center" }}>
        <a href="/businesses" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
          ← Back to Island Directory
        </a>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .biz-detail-grid { grid-template-columns: 1fr !important; }
        }
        @media (hover: hover) and (pointer: fine) {
          .biz-gallery-img:hover { transform: scale(1.04); }
        }
      `}</style>
    </main>
  );
}
