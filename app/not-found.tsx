"use client";

import Link from "next/link";
import Navbar from "@/components/public/Navbar";

export default function NotFound() {
  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div className="container" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", paddingTop: "100px" }}>
        <div>
          <h4 style={{ color: "var(--gold)", letterSpacing: "4px", marginBottom: "16px" }}>404 ERROR</h4>
          <h1 style={{ fontSize: "clamp(48px, 10vw, 120px)", lineHeight: "1", marginBottom: "24px" }}>Lost at <span style={{ color: "var(--teal)" }}>Sea?</span></h1>
          <p style={{ color: "var(--text-light)", maxWidth: "500px", margin: "0 auto 40px", fontSize: "18px" }}>
            The island you are looking for has drifted away. 
            Let us guide you back to the serenity of our main shore.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <Link href="/" className="btn-luxury">Return Home</Link>
            <Link href="/#booking" className="btn-outline-gold">Book Your Stay</Link>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div style={{ 
        position: "fixed", 
        bottom: "-100px", 
        left: "-100px", 
        width: "400px", 
        height: "400px", 
        background: "var(--teal)", 
        borderRadius: "50%", 
        opacity: 0.03, 
        zIndex: -1 
      }} />
      <div style={{ 
        position: "fixed", 
        top: "20%", 
        right: "-50px", 
        width: "200px", 
        height: "200px", 
        background: "var(--gold)", 
        borderRadius: "50%", 
        opacity: 0.05, 
        zIndex: -1 
      }} />
    </main>
  );
}
