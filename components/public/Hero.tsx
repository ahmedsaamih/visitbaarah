"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroProps { imageUrl?: string; }

export default function Hero({ imageUrl }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const finalImage = imageUrl || "/images/hero.png";

  useEffect(() => {
    // Line-by-line slide-up on mount
    gsap.to(".hero-line", {
      y: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.18,
      ease: "power4.out",
      delay: 0.2,
    });

    // Parallax background on scroll
    const tl = gsap.to(".hero-bg", {
      yPercent: 25,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Fade out hero content on scroll
    gsap.to(".hero-content-inner", {
      opacity: 0,
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "20% top",
        end: "60% top",
        scrub: true,
      },
    });

    return () => { tl.kill(); ScrollTrigger.getAll().forEach(st => st.kill()); };
  }, []);

  return (
    <section
      ref={heroRef}
      style={{
        height: "100svh",
        minHeight: "600px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        color: "#fff",
      }}
    >
      {/* Parallax background */}
      <div
        className="hero-bg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "130%",
          top: "-15%",
          backgroundImage: `url(${finalImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />

      {/* Gradient overlays */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(9,15,10,0.25) 0%, rgba(9,15,10,0.55) 60%, rgba(9,15,10,0.75) 100%)",
      }} />

      {/* Content */}
      <div className="container hero-content-inner" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>

        <div className="hero-line" style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(9px, 1.4vw, 11px)",
              letterSpacing: "6px",
              textTransform: "uppercase",
              opacity: 0.5,
              marginBottom: "10px",
              fontWeight: 400,
            }}>
              HA. Baarah &nbsp;·&nbsp; Maldives
            </div>
            <div style={{
              fontSize: "clamp(30px, 6vw, 68px)",
              fontWeight: 900,
              letterSpacing: "clamp(4px, 1vw, 10px)",
              textTransform: "uppercase",
              lineHeight: 1,
              color: "#fff",
            }}>
              Visit Baarah
            </div>
          </div>
        </div>

        <p className="hero-line" style={{
          fontSize: "clamp(11px, 1.8vw, 14px)",
          letterSpacing: "5px",
          textTransform: "uppercase",
          opacity: 0.65,
          marginBottom: "clamp(16px, 3vw, 28px)",
          fontWeight: 400,
        }}>
          HA. Baarah &nbsp;·&nbsp; Haa Alif Atoll &nbsp;·&nbsp; Maldives
        </p>

        <h1 className="hero-line" style={{
          fontSize: "clamp(32px, 6.5vw, 80px)",
          fontWeight: 800,
          lineHeight: 1.05,
          marginBottom: "clamp(20px, 4vw, 36px)",
          letterSpacing: "-1px",
          maxWidth: "820px",
          marginInline: "auto",
        }}>
          Where the Real<br />
          <span style={{ color: "var(--gold-light)" }}>Maldives Begins</span>
        </h1>

        <p className="hero-line" style={{
          fontSize: "clamp(15px, 2vw, 18px)",
          opacity: 0.72,
          maxWidth: "520px",
          margin: "0 auto clamp(28px, 5vw, 48px)",
          lineHeight: 1.65,
          fontWeight: 300,
        }}>
          Pristine shores, lush farmland, and the warmth of authentic northern Maldivian life.
        </p>

        <div className="hero-line" style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          <a
            href="#discover"
            className="btn-luxury"
            style={{ padding: "16px 36px", fontSize: "14px", background: "var(--gold)", color: "#fff" }}
          >
            Discover Baarah
          </a>
          <a
            href="#explore"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "15px 36px",
              border: "1.5px solid rgba(255,255,255,0.5)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 500,
              borderRadius: "6px",
              fontSize: "14px",
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(6px)",
              transition: "border-color 0.25s, background 0.25s",
            }}
          >
            Explore the Island
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute",
        bottom: "36px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        opacity: 0.5,
      }}>
        <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>Scroll</span>
        <div style={{ width: "1px", height: "52px", background: "rgba(255,255,255,0.3)", overflow: "hidden", position: "relative" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "40%",
            background: "#fff",
            animation: "scrollDrop 2s ease-in-out infinite",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes scrollDrop {
          0%   { top: -40%; }
          100% { top: 140%; }
        }
      `}</style>
    </section>
  );
}
