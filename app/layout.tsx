import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Serene Seaview | Thoddoo Island Bliss",
  description: "Experience the ultimate island getaway at Serene Seaview. Affordable luxury in the heart of AA. Thoddoo, Maldives.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
  },
  openGraph: {
    title: "Serene Seaview | Thoddoo Island Bliss",
    description: "Experience the ultimate island getaway at Serene Seaview. Affordable luxury in the heart of AA. Thoddoo, Maldives.",
    url: "/",
    siteName: "Serene Seaview",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Serene Seaview | Thoddoo Island Bliss",
    description: "Experience the ultimate island getaway at Serene Seaview. Affordable luxury in the heart of AA. Thoddoo, Maldives.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
        
        {/* Scripts (CDN) */}
        <script src="https://code.jquery.com/jquery-3.7.1.min.js" defer></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
