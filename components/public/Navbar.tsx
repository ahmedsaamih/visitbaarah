"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`nav-public ${scrolled ? "scrolled" : ""}`}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ 
          fontSize: "24px", 
          fontWeight: "800", 
          textDecoration: "none", 
          color: scrolled ? "var(--teal)" : "var(--teal)",
          fontFamily: "var(--font-serif)"
        }}>
          SERENE
        </Link>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link href="#about" className="nav-link-public">About</Link>
          <Link href="#rooms" className="nav-link-public">Rooms</Link>
          <Link href="#activities" className="nav-link-public">Activities</Link>
          <Link href="#dining" className="nav-link-public">Dining</Link>
          <Link href="#booking" className="btn-luxury" style={{ marginLeft: "32px", padding: "10px 24px", fontSize: "12px" }}>Book Now</Link>
        </div>
      </div>
    </nav>
  );
}
