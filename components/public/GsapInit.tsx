"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function GsapInit() {
  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── 1. Clip-path image reveals (bottom-to-top wipe) ──────────
      gsap.utils.toArray<HTMLElement>(".reveal-img").forEach(el => {
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "power4.inOut",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });

      // ── 2. Parallax images ────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>(".parallax-img").forEach(el => {
        const wrap = el.closest<HTMLElement>(".parallax-wrap") || el.parentElement;
        gsap.to(el, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // ── 3. Generic slide-up reveals ───────────────────────────────
      gsap.utils.toArray<HTMLElement>(".s-up").forEach(el => {
        gsap.from(el, {
          y: 55,
          opacity: 0,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // ── 4. Staggered children ─────────────────────────────────────
      gsap.utils.toArray<HTMLElement>(".stagger-row").forEach(row => {
        const items = Array.from(row.children) as HTMLElement[];
        gsap.from(items, {
          y: 70,
          opacity: 0,
          duration: 0.85,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 82%", once: true },
        });
      });

      // ── 5. Horizontal line expand ─────────────────────────────────
      gsap.utils.toArray<HTMLElement>(".line-expand").forEach(el => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.4,
          ease: "power3.inOut",
          scrollTrigger: { trigger: el, start: "top 92%" },
        });
      });

      // ── 6. Counter numbers ────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach(el => {
        const end = parseInt(el.getAttribute("data-count") || "0");
        const obj = { val: 0 };
        gsap.to(obj, {
          val: end,
          duration: 2.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate() {
            el.textContent = Math.round(obj.val).toLocaleString();
          },
        });
      });

      // ── 7. Legacy .reveal class (backward compat) ─────────────────
      gsap.utils.toArray<HTMLElement>(".reveal").forEach(el => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // ── 8. Dark-section panel slide-ins ──────────────────────────
      gsap.utils.toArray<HTMLElement>(".slide-in-left").forEach(el => {
        gsap.from(el, {
          x: -60,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>(".slide-in-right").forEach(el => {
        gsap.from(el, {
          x: 60,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      // ── 9. Section stats bar ──────────────────────────────────────
      gsap.from(".stats-bar-item", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".stats-bar", start: "top 92%", once: true },
      });

      // ── 10. Event row image zoom-in ───────────────────────────────
      gsap.utils.toArray<HTMLElement>(".event-img-panel").forEach(panel => {
        const img = panel.querySelector<HTMLElement>(".parallax-img");
        if (!img) return;
        gsap.from(img, {
          scale: 1.12,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: panel, start: "top 90%", once: true },
        });
      });

    });

    return () => ctx.revert();
  }, []);

  return null;
}
