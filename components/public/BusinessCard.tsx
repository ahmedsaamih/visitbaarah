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
  const img   = coverPhotoUrl || media?.[0]?.url || FALLBACK;
  const label = TYPE_LABELS[businessType] || "Business";

  return (
    <div className="biz-card">
      <Link href={`/businesses/${slug}`} style={{ textDecoration: "none", display: "block" }}>
        <div className="biz-card-img parallax-wrap">
          <div className="parallax-img" style={{ backgroundImage: `url(${img})` }} />
          <span className="type-pill">{label}</span>
        </div>
      </Link>

      <div className="biz-card-body">
        <Link href={`/businesses/${slug}`} style={{ textDecoration: "none" }}>
          <h3>{name}</h3>
        </Link>
        {shortDescription && <p>{shortDescription}</p>}

        <div className="biz-card-footer">
          {connectLinks && connectLinks.length > 0 ? (
            <ConnectViaButton links={connectLinks} />
          ) : (
            <Link href={`/businesses/${slug}`} className="link-arrow">
              View profile
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
