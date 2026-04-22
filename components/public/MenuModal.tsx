"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
  isVegetarian: boolean;
}

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

export default function MenuModal({ isOpen, onClose, menuItems }: MenuModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const tl = gsap.timeline();
      
      tl.to(overlayRef.current, { opacity: 1, duration: 0.4 })
        .to(modalRef.current, { y: 0, opacity: 1, duration: 0.6, ease: "power4.out" }, "-=0.2")
        .from(".menu-category-block", {
          y: 20,
          opacity: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out"
        }, "-=0.3");
    } else {
      document.body.style.overflow = "auto";
      gsap.to(modalRef.current, { y: 50, opacity: 0, duration: 0.4, ease: "power4.in" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, delay: 0.1, onComplete: onClose });
    }
  }, [isOpen]);

  if (!isOpen && !overlayRef.current) return null;

  const categories = ["breakfast", "lunch", "dinner", "drinks", "desserts", "snacks"];
  const groupedMenu = categories.reduce((acc, cat) => {
    const items = menuItems.filter(i => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%", 
        zIndex: 1000,
        display: isOpen ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      {/* Overlay */}
      <div 
        ref={overlayRef}
        onClick={() => onClose()}
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          background: "rgba(13, 92, 92, 0.9)", // Dark teal theme
          backdropFilter: "blur(8px)",
          opacity: 0
        }} 
      />

      {/* Modal Content */}
      <div 
        ref={modalRef}
        style={{ 
          position: "relative",
          width: "100%",
          maxWidth: "900px",
          maxHeight: "92vh",
          background: "var(--cream)",
          borderRadius: "clamp(12px, 3vw, 24px)",
          overflow: "hidden",
          opacity: 0,
          transform: "translateY(50px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: "clamp(20px, 5vw, 32px) clamp(24px, 6vw, 40px)", 
          borderBottom: "1px solid var(--border)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          background: "#fff"
        }}>
          <div>
            <h4 style={{ color: "var(--gold)", letterSpacing: "2px", fontSize: "12px", marginBottom: "4px" }}>RESTAURANT</h4>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 32px)", margin: 0 }}>The Full Menu</h2>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: "var(--border)", 
              border: "none", 
              width: "36px", 
              height: "36px", 
              borderRadius: "50%", 
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div 
          ref={contentRef}
          style={{ 
            padding: "clamp(24px, 5vw, 40px)", 
            overflowY: "auto", 
            maxHeight: "calc(92vh - 100px)",
            background: "var(--cream)"
          }}
        >
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category} className="menu-category-block" style={{ marginBottom: " clamp(32px, 6vw, 48px)" }}>
              <h3 style={{ 
                fontSize: "14px", 
                textTransform: "uppercase", 
                letterSpacing: "3px", 
                color: "var(--gold)",
                borderBottom: "2px solid var(--gold)",
                display: "inline-block",
                paddingBottom: "6px",
                marginBottom: "20px"
              }}>
                {category}
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(var(--min-width, 280px), 1fr))", 
                gap: "clamp(16px, 3vw, 24px)" 
              }}>
                {items.map(item => (
                  <div key={item.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                      <h4 style={{ fontSize: "16px", margin: 0, color: "var(--text)", flex: 1, paddingRight: "10px" }}>
                        {item.name} {item.isVegetarian && <span style={{ fontSize: "12px", color: "#10b981" }}>🌱</span>}
                      </h4>
                      <span style={{ fontWeight: "700", color: "var(--teal)", fontSize: "15px" }}>${item.price}</span>
                    </div>
                    {item.description && (
                      <p style={{ fontSize: "13px", color: "var(--text-light)", margin: 0, lineHeight: "1.5" }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(groupedMenu).length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", opacity: 0.5 }}>
              <p>Our chef is currently updating the menu. Please check back soon.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "24px 40px", background: "#f9f7f2", borderTop: "1px solid var(--border)", textAlign: "center", fontSize: "13px", color: "var(--text-light)" }}>
          Prices are in USD and include all applicable taxes.
        </div>
      </div>
    </div>
  );
}
