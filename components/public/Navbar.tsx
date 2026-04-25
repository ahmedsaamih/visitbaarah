"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "#about", label: "About" },
    { href: "#rooms", label: "Rooms" },
    { href: "#activities", label: "Activities" },
    { href: "#dining", label: "Dining" },
    { href: "#booking", label: "Book Now", isPrimary: true },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <>
      <nav className={`nav-public ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-public-inner">
        <Link href="/" className="nav-brand-logo" aria-label="Serene Seaview Home">
          <Image
            src="/images/logo.PNG"
            alt="Serene Seaview"
            width={220}
            height={56}
            priority
            style={{ width: "auto", height: "46px" }}
          />
        </Link>
        <div className="nav-public-desktop">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href} className="nav-link-public">
              {item.label}
            </Link>
          ))}
          <Link href="#booking" className="btn-luxury" style={{ marginLeft: "32px", padding: "10px 24px", fontSize: "12px" }}>
            Book Now
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
