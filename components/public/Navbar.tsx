"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "#discover", label: "Discover" },
    { href: "#explore", label: "Explore" },
    { href: "#events", label: "Events" },
    { href: "/businesses", label: "Directory" },
    { href: "#transport", label: "Get Around", isPrimary: true },
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
            <Image
              src="/images/logo-visitbaarah.png"
              alt="Visit Baarah"
              width={200}
              height={200}
              priority
              style={{ height: "clamp(48px, 6vw, 64px)", width: "auto" }}
            />
          </Link>

          <div className="nav-public-desktop">
            {navItems.slice(0, 4).map((item) => (
              <Link key={item.href} href={item.href} className="nav-link-public">
                {item.label}
              </Link>
            ))}
            <Link
              href="#transport"
              className="btn-luxury"
              style={{ marginLeft: "28px", padding: "10px 22px", fontSize: "13px", borderRadius: "8px" }}
            >
              Get Around
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
