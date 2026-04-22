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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = children.length;

  const goTo = (newIndex: number) => {
    let target = newIndex;
    if (target < 0) target = total - 1;
    if (target >= total) target = 0;
    setIndex(target);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Auto-play logic
  useEffect(() => {
    if (autoPlay) {
      timerRef.current = setInterval(next, interval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, autoPlay, interval]);

  // Animation logic
  useEffect(() => {
    if (!trackRef.current) return;
    
    gsap.to(trackRef.current, {
      xPercent: -index * (100 / (total > 0 ? 1 : 1)), // Basic slide logic
      // In a real responsive carousel, we'd calculate based on container width vs item width
      // But for a simple "full width" or "card by card" feel:
      x: `-${index * 100}%`,
      duration: 0.8,
      ease: "power2.inOut",
    });
  }, [index, total]);

  if (total === 0) return null;

  return (
    <div className={`carousel-container ${className}`} ref={containerRef} style={{ position: "relative", overflow: "hidden", width: "100%" }}>
      {/* Track */}
      <div 
        ref={trackRef} 
        style={{ 
          display: "flex", 
          width: `${total * 100}%`,
          touchAction: "pan-y"
        }}
      >
        {React.Children.map(children, (child) => (
          <div style={{ 
            width: `${100 / (total > 0 ? total : 1)}%`,
            flexShrink: 0 
          }}>
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && total > 1 && (
        <>
          <button 
            onClick={prev}
            className="carousel-arrow"
            style={{ 
              position: "absolute", 
              left: "10px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              zIndex: 10,
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
            ←
          </button>
          <button 
            onClick={next}
            className="carousel-arrow"
            style={{ 
              position: "absolute", 
              right: "10px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              zIndex: 10,
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
            →
          </button>
        </>
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
    </div>
  );
}
