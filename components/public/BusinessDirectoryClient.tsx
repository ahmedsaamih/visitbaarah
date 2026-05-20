"use client";

import { useState } from "react";
import BusinessCard from "./BusinessCard";

interface ConnectLink { type: string; value: string; }
interface MediaItem { url: string; }
interface Business {
  id: number;
  name: string;
  slug: string;
  businessType: string;
  shortDescription?: string | null;
  coverPhotoUrl?: string | null;
  connectLinks?: ConnectLink[] | null;
  media?: MediaItem[];
}

interface Props { businesses: Business[]; }

type Tab = "all" | "stay" | "eat" | "transport" | "explore" | "other";

const TABS: { id: Tab; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "stay",      label: "Stay" },
  { id: "eat",       label: "Eat & Drink" },
  { id: "transport", label: "Getting Around" },
  { id: "explore",   label: "Explore" },
  { id: "other",     label: "Other" },
];

const TYPE_TO_TAB: Record<string, Tab> = {
  guesthouse: "stay",
  restaurant:  "eat",
  cafe:        "eat",
  transport:   "transport",
  tour_guide:  "explore",
  dive_shop:   "explore",
  grocery:     "other",
  spa:         "other",
  other:       "other",
};

export default function BusinessDirectoryClient({ businesses }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filtered = activeTab === "all"
    ? businesses
    : businesses.filter((b) => (TYPE_TO_TAB[b.businessType] || "other") === activeTab);

  return (
    <>
      {/* Category tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        marginBottom: "clamp(36px, 5vw, 56px)",
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 18px",
              borderRadius: "100px",
              border: "1.5px solid",
              borderColor: activeTab === tab.id ? "var(--green)" : "var(--border)",
              background: activeTab === tab.id ? "var(--green)" : "#fff",
              color: activeTab === tab.id ? "#fff" : "var(--text-mid)",
              fontFamily: "inherit",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p style={{ color: "var(--text-light)", fontSize: "13px", marginBottom: "24px" }}>
        {filtered.length} {filtered.length === 1 ? "business" : "businesses"}
        {activeTab !== "all" ? ` in ${TABS.find(t => t.id === activeTab)?.label}` : " on Baarah"}
      </p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-light)" }}>
          <p style={{ fontSize: "15px" }}>No listings in this category yet.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "clamp(16px, 2.5vw, 24px)",
        }}>
          {filtered.map((b) => (
            <BusinessCard key={b.id} {...b} />
          ))}
        </div>
      )}
    </>
  );
}
