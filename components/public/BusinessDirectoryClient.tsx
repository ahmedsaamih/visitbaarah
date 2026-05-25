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
  restaurant: "eat",
  cafe:       "eat",
  transport:  "transport",
  tour_guide: "explore",
  dive_shop:  "explore",
  grocery:    "other",
  spa:        "other",
  other:      "other",
};

export default function BusinessDirectoryClient({ businesses }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filtered = activeTab === "all"
    ? businesses
    : businesses.filter((b) => (TYPE_TO_TAB[b.businessType] || "other") === activeTab);

  return (
    <>
      {/* Category filter */}
      <div className="dir-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`dir-tab-btn${activeTab === tab.id ? " active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="dir-count">
        {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
        {activeTab !== "all" && ` in ${TABS.find(t => t.id === activeTab)?.label}`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="dir-empty">
          <p>No listings in this category yet.</p>
          <button onClick={() => setActiveTab("all")} className="dir-tab-btn" style={{ marginTop: "20px" }}>
            View all listings
          </button>
        </div>
      ) : (
        <div className="biz-grid">
          {filtered.map((b) => (
            <BusinessCard key={b.id} {...b} />
          ))}
        </div>
      )}
    </>
  );
}
