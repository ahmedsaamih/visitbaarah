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
    gsap.to(".hero-line", {
      y: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.15,
      ease: "power4.out",
      delay: 0.2,
    });

    const tl = gsap.to(".hero-bg", {
      yPercent: 22,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".hero-content-inner", {
      opacity: 0,
      y: -30,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "25% top",
        end: "65% top",
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
        alignItems: "flex-end",
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
          backgroundPosition: "center 30%",
          zIndex: 0,
        }}
      />

      {/* Layered gradients for editorial left-read */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to right, rgba(9,15,10,0.82) 0%, rgba(9,15,10,0.45) 55%, rgba(9,15,10,0.2) 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to top, rgba(9,15,10,0.7) 0%, transparent 50%)",
      }} />

      {/* Content — left-aligned, bottom of frame */}
      <div
        className="container hero-content-inner"
        style={{
          position: "relative",
          zIndex: 2,
          paddingBottom: "clamp(72px, 12vw, 120px)",
          maxWidth: "1240px",
        }}
      >
        <div style={{ maxWidth: "clamp(320px, 58vw, 680px)" }}>

          <div className="hero-line" style={{
            fontSize: "clamp(9px, 1.2vw, 11px)",
            letterSpacing: "6px",
            textTransform: "uppercase",
            opacity: 0.5,
            marginBottom: "20px",
            fontWeight: 400,
          }}>
            HA. Baarah &nbsp;·&nbsp; Haa Alif Atoll &nbsp;·&nbsp; Maldives
          </div>

          <h1 className="hero-line" style={{
            fontSize: "clamp(38px, 7vw, 88px)",
            fontWeight: 900,
            lineHeight: 1.0,
            marginBottom: "clamp(18px, 3vw, 28px)",
            letterSpacing: "-2px",
            color: "#fff",
          }}>
            The Maldives,<br />
            <span style={{ color: "var(--gold-light)", fontStyle: "italic", fontWeight: 300, letterSpacing: "-1px" }}>
              Without the Resort.
            </span>
          </h1>

          <p className="hero-line" style={{
            fontSize: "clamp(14px, 1.8vw, 17px)",
            opacity: 0.7,
            maxWidth: "520px",
            marginBottom: "clamp(28px, 5vw, 44px)",
            lineHeight: 1.75,
            fontWeight: 300,
          }}>
            Pristine mangroves, a reef alive with sharks and mantas, farmland feeding
            a nation, and an island with 500 years of living history.
          </p>

          <div className="hero-line" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a
              href="#discover"
              className="btn-luxury"
              style={{ padding: "14px 32px", fontSize: "13px", background: "var(--gold)", borderRadius: "4px" }}
            >
              Explore the Island
            </a>
            <a
              href="/businesses"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "13px 32px",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "rgba(255,255,255,0.85)",
                textDecoration: "none",
                fontWeight: 500,
                borderRadius: "4px",
                fontSize: "13px",
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(6px)",
                transition: "border-color 0.25s, background 0.25s",
                letterSpacing: "0.2px",
              }}
            >
              Island Directory
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute",
        bottom: "32px",
        right: "clamp(20px, 4vw, 48px)",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        opacity: 0.35,
      }}>
        <span style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", writingMode: "vertical-lr" }}>Scroll</span>
        <div style={{ width: "1px", height: "48px", background: "rgba(255,255,255,0.4)", overflow: "hidden", position: "relative" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "40%",
            background: "#fff",
            animation: "scrollDrop 2s ease-in-out infinite",
          }} />
        </div>
      </div>
    </section>
  );
}
