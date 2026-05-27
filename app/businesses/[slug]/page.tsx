import { db } from "@/db";
import { businesses, roomTypes } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import ConnectViaButton from "@/components/public/ConnectViaButton";
import InquiryForm from "@/components/public/InquiryForm";
import GuestHouseBookingForm from "@/components/public/GuestHouseBookingForm";
import type { Metadata } from "next";

const BOOKABLE_TYPES = ["guesthouse"];

export const dynamic = "force-dynamic";

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

  const bizRoomTypes = biz.businessType === "guesthouse"
    ? await db.query.roomTypes.findMany({
        where: and(eq(roomTypes.businessId, biz.id), eq(roomTypes.isActive, true)),
        orderBy: [asc(roomTypes.sortOrder)],
      })
    : [];

  const connectLinks = (biz.connectLinks || []) as { type: string; value: string }[];
  const heroImg = biz.coverPhotoUrl || biz.media?.[0]?.url || "/images/hero.png";
  const galleryImages = biz.media?.filter((m) => m.url !== biz.coverPhotoUrl) || [];
  const typeLabel = TYPE_LABELS[biz.businessType] || "Business";

  return (
    <main style={{ overflowX: "hidden" }}>
      <Navbar />

      {/* Hero image */}
      <section style={{
        height: "clamp(260px, 45vw, 480px)",
        minHeight: "260px",
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
          background: "linear-gradient(to bottom, rgba(9,15,10,0.25) 0%, rgba(9,15,10,0.72) 100%)",
        }} />
        <div className="container" style={{
          position: "relative", zIndex: 1,
          height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          paddingBottom: "clamp(28px, 5vw, 52px)",
          paddingTop: "100px",
        }}>
          {/* Back link */}
          <a href="/businesses" className="biz-detail-back">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M11.5 7H2.5M6 3.5L2.5 7 6 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Island Directory
          </a>
          <div style={{
            display: "inline-block",
            background: "var(--gold)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: "100px",
            marginBottom: "14px",
            alignSelf: "flex-start",
          }}>
            {typeLabel}
          </div>
          <h1 style={{
            fontSize: "clamp(26px, 5vw, 52px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.5px",
            color: "#fff",
            marginBottom: connectLinks.length > 0 ? "16px" : "0",
          }}>
            {biz.name}
          </h1>
          {connectLinks.length > 0 && <ConnectViaButton links={connectLinks} />}
        </div>
      </section>

      {/* Main content */}
      <section style={{ background: "var(--cream)", padding: "clamp(40px, 7vw, 80px) 0" }}>
        <div className="container">
          <div className="biz-detail-grid">

            {/* Left: about + gallery */}
            <div>
              {biz.shortDescription && (
                <p style={{
                  fontSize: "clamp(16px, 2vw, 18px)",
                  color: "var(--text-mid)",
                  lineHeight: 1.8,
                  marginBottom: "32px",
                  fontWeight: 400,
                }}>
                  {biz.shortDescription}
                </p>
              )}
              {biz.description && (
                <div style={{ marginBottom: "clamp(36px, 6vw, 56px)" }}>
                  <p className="overline" style={{ marginBottom: "14px" }}>About</p>
                  <p style={{ fontSize: "15px", color: "var(--text-mid)", lineHeight: 1.85 }}>
                    {biz.description}
                  </p>
                </div>
              )}

              {galleryImages.length > 0 && (
                <div>
                  <p className="overline" style={{ marginBottom: "16px" }}>Gallery</p>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "10px",
                  }}>
                    {galleryImages.map((m) => (
                      <div key={m.url} style={{ aspectRatio: "4/3", borderRadius: "8px", overflow: "hidden" }}>
                        <img
                          src={m.url}
                          alt={biz.name}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: contact card + inquiry form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Contact info */}
              {(biz.contactPhone || biz.contactEmail || biz.address) && (
                <div className="biz-detail-card">
                  <p className="overline" style={{ marginBottom: "16px" }}>Contact</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {biz.address && (
                      <div className="biz-contact-row">
                        <span className="biz-contact-label">Location</span>
                        <span className="biz-contact-value">{biz.address}</span>
                      </div>
                    )}
                    {biz.contactPhone && (
                      <div className="biz-contact-row">
                        <span className="biz-contact-label">Phone</span>
                        <a href={`tel:${biz.contactPhone}`} className="biz-contact-link">
                          {biz.contactPhone}
                        </a>
                      </div>
                    )}
                    {biz.contactEmail && (
                      <div className="biz-contact-row">
                        <span className="biz-contact-label">Email</span>
                        <a href={`mailto:${biz.contactEmail}`} className="biz-contact-link">
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

              {/* Booking or inquiry form */}
              <div className="biz-detail-card">
                {BOOKABLE_TYPES.includes(biz.businessType) ? (
                  <>
                    <p className="overline" style={{ marginBottom: "8px" }}>Book Your Stay</p>
                    <h2 style={{ fontSize: "20px", marginBottom: "24px", letterSpacing: "-0.3px", fontWeight: 700 }}>
                      Request a Booking
                    </h2>
                    <GuestHouseBookingForm
                    businessId={biz.id}
                    businessName={biz.name}
                    slug={slug}
                    initialRoomTypes={bizRoomTypes.map((rt) => ({
                      id: rt.id,
                      name: rt.name,
                      description: rt.description,
                      basePrice: rt.basePrice,
                      maxGuests: rt.maxGuests,
                      bedType: rt.bedType,
                      size: rt.size,
                    }))}
                  />
                  </>
                ) : (
                  <>
                    <p className="overline" style={{ marginBottom: "8px" }}>Get in Touch</p>
                    <h2 style={{ fontSize: "20px", marginBottom: "24px", letterSpacing: "-0.3px", fontWeight: 700 }}>
                      Send a message
                    </h2>
                    <InquiryForm businessId={biz.id} businessName={biz.name} />
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div style={{ background: "var(--deep)", padding: "clamp(40px, 6vw, 64px) 0 28px" }}>
        <div className="container">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            paddingBottom: "24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            marginBottom: "24px",
          }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: "15px", color: "#fff", letterSpacing: "-0.3px", marginBottom: "4px" }}>
                VISIT BAARAH
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>HA. Baarah · Haa Alif Atoll · Maldives</p>
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
              <a href="/businesses" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
                Directory
              </a>
              <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
                Home
              </a>
            </div>
          </div>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
            &copy; {new Date().getFullYear()} Visit Baarah
          </span>
          <div style={{ marginTop: "12px", fontSize: "10px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.3px" }}>
            Built & maintained by Ahmed Saamih &middot; <a href="mailto:ahmed.saamih@icloud.com" style={{ color: "inherit", textDecoration: "none" }}>ahmed.saamih@icloud.com</a> &middot; +960 912 4400
          </div>
        </div>
      </div>
    </main>
  );
}
