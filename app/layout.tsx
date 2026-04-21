import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serene Seaview | Thoddoo Island Bliss",
  description: "Experience the ultimate island getaway at Serene Seaview. Affordable luxury in the heart of AA. Thoddoo, Maldives.",
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
