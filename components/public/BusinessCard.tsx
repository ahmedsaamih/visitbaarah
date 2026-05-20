import Link from "next/link";
import ConnectViaButton from "./ConnectViaButton";

interface ConnectLink { type: string; value: string; }
interface MediaItem { url: string; }

interface BusinessCardProps {
  id: number;
  name: string;
  slug: string;
  businessType: string;
  shortDescription?: string | null;
  coverPhotoUrl?: string | null;
  connectLinks?: ConnectLink[] | null;
  media?: MediaItem[];
}

const TYPE_LABELS: Record<string, string> = {
  guesthouse: "Stay",
  restaurant: "Restaurant",
  cafe: "Café",
  transport: "Transport",
  tour_guide: "Tours",
  dive_shop: "Diving",
  grocery: "Grocery",
  spa: "Spa",
  other: "Local Business",
};

const FALLBACK = "/images/hero.png";

export default function BusinessCard({
  name, slug, businessType, shortDescription,
  coverPhotoUrl, connectLinks, media,
}: BusinessCardProps) {
  const img = coverPhotoUrl || media?.[0]?.url || FALLBACK;
  const label = TYPE_LABELS[businessType] || "Business";

  return (
    <div style={{
      borderRadius: "14px",
      overflow: "hidden",
      background: "#fff",
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.3s, box-shadow 0.3s",
    }}
      className="biz-card"
    >
      <Link href={`/businesses/${slug}`} style={{ textDecoration: "none", display: "block" }}>
        <div className="parallax-wrap" style={{ height: "200px", position: "relative" }}>
          <div className="parallax-img" style={{ backgroundImage: `url(${img})` }} />
          <div style={{
            position: "absolute", top: "12px", left: "12px",
            background: "var(--green)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: "100px",
          }}>
            {label}
          </div>
        </div>
      </Link>

      <div style={{ padding: "20px 20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <Link href={`/businesses/${slug}`} style={{ textDecoration: "none" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>{name}</h3>
        </Link>
        {shortDescription && (
          <p style={{ fontSize: "13px", color: "var(--text-light)", lineHeight: 1.6, flex: 1 }}>
            {shortDescription}
          </p>
        )}
        {connectLinks && connectLinks.length > 0 && (
          <div style={{ marginTop: "auto", paddingTop: "4px" }}>
            <ConnectViaButton links={connectLinks} />
          </div>
        )}
      </div>

      <style>{`
        .biz-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,0.12); }
      `}</style>
    </div>
  );
}
