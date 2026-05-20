"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

interface GsapCarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

export default function GsapCarousel({
  children,
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className = "",
}: GsapCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const total = children.length;

  const goTo = (newIndex: number) => {
    let target = newIndex;
    if (target < 0) target = total - 1;
    if (target >= total) target = 0;
    setIndex(target);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(media.matches);
    onChange();
    const hasSwipedBefore = window.localStorage.getItem("vb_swipe_hint_seen") === "1";
    const timer = setTimeout(() => {
      setShowSwipeHint(!hasSwipedBefore && media.matches);
    }, 0);
    media.addEventListener("change", onChange);
    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", onChange);
    };
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % total);
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, interval, total]);

  // Animation logic
  useEffect(() => {
    if (!trackRef.current) return;
    
    gsap.to(trackRef.current, {
      xPercent: -index * 100,
      duration: 0.8,
      ease: "power2.inOut",
    });
  }, [index, total]);

  if (total === 0) return null;

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.changedTouches[0]?.clientX ?? null;
    touchEndXRef.current = null;
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const delta = touchStartXRef.current - touchEndXRef.current;
    const threshold = 42;
    if (Math.abs(delta) < threshold) return;
    if (showSwipeHint) {
      setShowSwipeHint(false);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("vb_swipe_hint_seen", "1");
      }
    }
    if (delta > 0) next();
    else prev();
  };

  return (
    <div
      className={`carousel-container ${className}`}
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        paddingBottom: showArrows && total > 1 && !isMobile ? "76px" : "0",
      }}
    >
      {/* Track */}
      <div 
        ref={trackRef} 
        style={{ 
          display: "flex", 
          width: "100%",
          touchAction: "pan-y"
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {React.Children.map(children, (child) => (
          <div style={{ 
            width: "100%",
            flexBasis: "100%",
            flexShrink: 0 
          }}>
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && total > 1 && !isMobile && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "10px",
            transform: "translateX(-50%)",
            zIndex: 10,
            display: "flex",
            gap: "10px",
            pointerEvents: "none",
          }}
        >
          <button 
            onClick={prev}
            className="carousel-arrow"
            style={{ 
              pointerEvents: "auto",
              width: "clamp(36px, 8vw, 50px)",
              height: "clamp(36px, 8vw, 50px)",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(16px, 4vw, 20px)",
              color: "var(--teal)",
              transition: "all 0.3s"
            }}
          >
            <span aria-hidden="true" style={{ fontSize: "clamp(20px, 5vw, 26px)", lineHeight: 1 }}>
              &#8249;
            </span>
          </button>
          <button 
            onClick={next}
            className="carousel-arrow"
            style={{ 
              pointerEvents: "auto",
              width: "clamp(36px, 8vw, 50px)",
              height: "clamp(36px, 8vw, 50px)",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(16px, 4vw, 20px)",
              color: "var(--teal)",
              transition: "all 0.3s"
            }}
          >
            <span aria-hidden="true" style={{ fontSize: "clamp(20px, 5vw, 26px)", lineHeight: 1 }}>
              &#8250;
            </span>
          </button>
        </div>
      )}

      {isMobile && total > 1 && showSwipeHint && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: showDots ? "38px" : "12px",
            transform: "translateX(-50%)",
            zIndex: 11,
            fontSize: "12px",
            letterSpacing: "1px",
            color: "var(--teal)",
            background: "rgba(255,255,255,0.92)",
            border: "1px solid var(--border)",
            borderRadius: "999px",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            pointerEvents: "none",
            animation: "swipeHintPulse 1.6s ease-in-out infinite",
          }}
        >
          <span aria-hidden="true" style={{ opacity: 0.8 }}>⇠ ⇢</span>
          <span>Swipe cards</span>
        </div>
      )}

      {/* Dots Indicator */}
      {showDots && total > 1 && (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "8px", 
          marginTop: "clamp(24px, 5vw, 40px)",
          position: "relative",
          zIndex: 10
        }}>
          {React.Children.map(children, (_, idx) => (
            <button
              onClick={() => goTo(idx)}
              style={{
                width: index === idx ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: index === idx ? "var(--teal)" : "var(--border)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes swipeHintPulse {
          0% { opacity: 0.55; transform: translateX(-50%) translateY(0); }
          50% { opacity: 1; transform: translateX(-50%) translateY(-2px); }
          100% { opacity: 0.55; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
