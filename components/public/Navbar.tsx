"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "#discover",  label: "The Island" },
    { href: "#nature",    label: "Nature" },
    { href: "#heritage",  label: "History" },
    { href: "#events",    label: "Events" },
    { href: "/businesses", label: "Directory", isPrimary: true },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <>
      <nav className={`nav-public ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-public-inner">
          <Link href="/" className="nav-brand-logo">
            {/* Text wordmark: shown when transparent (logo PNG has opaque white bg) */}
            <span className="nav-wordmark" aria-hidden="false">VISIT BAARAH</span>
            {/* Logo image: shown only when nav is scrolled (white bg, matches nav bg) */}
            <Image
              src="/images/logo-visitbaarah.png"
              alt="Visit Baarah"
              width={200}
              height={200}
              priority
              className="nav-logo-img"
              style={{ height: "clamp(52px, 5vw, 64px)", width: "auto" }}
            />
          </Link>

          <div className="nav-public-desktop">
            {navItems.slice(0, 4).map((item) => (
              <Link key={item.href} href={item.href} className="nav-link-public">
                {item.label}
              </Link>
            ))}
            <Link
              href="/businesses"
              className="btn-luxury"
              style={{ marginLeft: "28px", padding: "10px 22px", fontSize: "13px", borderRadius: "8px" }}
            >
              Island Directory
            </Link>
          </div>
        </div>
      </nav>

      <div className={`mobile-fab-nav ${mobileOpen ? "open" : ""}`}>
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-fab-item ${item.isPrimary ? "primary" : ""}`}
            style={{ ["--item-index" as string]: String(index) }}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          className="mobile-fab-trigger"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? "×" : "☰"}
        </button>
      </div>
    </>
  );
}
