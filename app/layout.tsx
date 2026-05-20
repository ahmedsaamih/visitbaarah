import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://visitbaarah.mv";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Visit Baarah | Discover HA. Baarah, Maldives",
  description: "Explore the authentic beauty of HA. Baarah — pristine beaches, lush agriculture, rich culture, and the true spirit of the northern Maldives.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
  },
  openGraph: {
    title: "Visit Baarah | Discover HA. Baarah, Maldives",
    description: "Explore the authentic beauty of HA. Baarah — pristine beaches, lush agriculture, rich culture, and the true spirit of the northern Maldives.",
    url: "/",
    siteName: "Visit Baarah",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visit Baarah | Discover HA. Baarah, Maldives",
    description: "Explore the authentic beauty of HA. Baarah — pristine beaches, lush agriculture, rich culture, and the true spirit of the northern Maldives.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
