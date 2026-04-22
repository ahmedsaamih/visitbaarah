"use client";

import { useEffect, useRef } from "react";

interface HeroProps {
  imageUrl?: string;
}

export default function Hero({ imageUrl }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const finalImage = imageUrl || "/images/hero.png";

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).gsap) {
      const gsap = (window as any).gsap;
      
      gsap.from(".hero-content > *", {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: "power4.out",
      });

      gsap.to(".hero-bg", {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 200,
        ease: "none",
      });
    }
  }, []);

  return (
    <section ref={heroRef} style={{ 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      position: "relative",
      overflow: "hidden",
      color: "#fff",
      textAlign: "center"
    }}>
      {/* Background Image with Parallax */}
      <div className="hero-bg" style={{ 
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "130%", // Extra height for parallax
        backgroundImage: `url(${finalImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: -1
      }}>
        {/* Overlay */}
        <div style={{ 
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))"
        }} />
      </div>

      <div className="container hero-content" style={{ zIndex: 1, paddingTop: "80px" }}>
        <h4 style={{ 
          color: "var(--gold)", 
          textTransform: "uppercase", 
          letterSpacing: "4px", 
          marginBottom: "24px",
          fontSize: "14px",
          fontWeight: "600"
        }}>
          Escape to Serenity
        </h4>
        <h1 style={{ 
          fontSize: "clamp(48px, 8vw, 96px)", 
          marginBottom: "32px",
          maxWidth: "900px",
          marginInline: "auto",
          lineHeight: "1.1"
        }}>
          Your Island <span style={{ color: "var(--gold)" }}>Paradise</span> Awaits
        </h1>
        <p style={{ 
          fontSize: "18px", 
          maxWidth: "600px", 
          margin: "0 auto 48px",
          opacity: 0.9,
          fontWeight: "400"
        }}>
          Discover the true essence of Maldivian hospitality at Serene Seaview. 
          Pristine beaches of Thoddoo, turquoise lagoons, and memories to last a lifetime.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px" }}>
          <a href="#booking" className="btn-luxury">Plan Your Escape</a>
          <a href="#activities" className="btn-outline-gold" style={{ borderColor: "#fff", color: "#fff" }}>Explore More</a>
        </div>
      </div>

      <div style={{ 
        position: "absolute",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        animation: "bounce 2s infinite"
      }}>
        <div style={{ width: "2px", height: "60px", background: "rgba(255,255,255,0.3)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "20px", background: "var(--gold)" }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0) translateX(-50%);}
          40% {transform: translateY(-10px) translateX(-50%);}
          60% {transform: translateY(-5px) translateX(-50%);}
        }
      `}</style>
    </section>
  );
}
