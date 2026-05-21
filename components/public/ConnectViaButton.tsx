"use client";

interface ConnectLink {
  type: string;
  value: string;
}

interface ConnectViaButtonProps {
  links: ConnectLink[];
  className?: string;
}

const LINK_CONFIG: Record<string, { label: string; href: (v: string) => string; bg: string }> = {
  whatsapp: {
    label: "WhatsApp",
    href: (v) => `https://wa.me/${v.replace(/\D/g, "")}`,
    bg: "#25D366",
  },
  phone: {
    label: "Call",
    href: (v) => `tel:${v}`,
    bg: "var(--green)",
  },
  instagram: {
    label: "Instagram",
    href: (v) => (v.startsWith("http") ? v : `https://instagram.com/${v.replace("@", "")}`),
    bg: "#E1306C",
  },
  website: {
    label: "Website",
    href: (v) => (v.startsWith("http") ? v : `https://${v}`),
    bg: "var(--forest)",
  },
  viber: {
    label: "Viber",
    href: (v) => `viber://chat?number=${v.replace(/\D/g, "")}`,
    bg: "#665CAC",
  },
};

const PRIORITY_ORDER = ["whatsapp", "phone", "instagram", "website", "viber"];

export default function ConnectViaButton({ links, className }: ConnectViaButtonProps) {
  if (!links || links.length === 0) return null;

  const sorted = [...links].sort((a, b) => {
    const ai = PRIORITY_ORDER.indexOf(a.type);
    const bi = PRIORITY_ORDER.indexOf(b.type);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const primary = sorted[0];
  const rest = sorted.slice(1, 4);

  const cfg = LINK_CONFIG[primary.type] || {
    label: primary.type,
    href: (v: string) => v,
    bg: "var(--green)",
  };

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }} className={className}>
      <a
        href={cfg.href(primary.value)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-luxury"
        style={{ background: cfg.bg, fontSize: "13px", padding: "10px 20px" }}
      >
        {cfg.label}
      </a>
      {rest.map((link) => {
        const c = LINK_CONFIG[link.type] || { label: link.type, href: (v: string) => v, bg: "var(--green)" };
        return (
          <a
            key={link.type}
            href={c.href(link.value)}
            target="_blank"
            rel="noopener noreferrer"
            className="connect-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "9px 16px",
              border: "1.5px solid var(--border)",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text)",
              textDecoration: "none",
              transition: "border-color 160ms cubic-bezier(0.23,1,0.32,1), color 160ms cubic-bezier(0.23,1,0.32,1), transform 100ms cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            {c.label}
          </a>
        );
      })}
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .connect-secondary:hover { border-color: var(--green); color: var(--green); }
        }
        .connect-secondary:active { transform: scale(0.97); }
      `}</style>
    </div>
  );
}
