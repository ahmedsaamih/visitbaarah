"use client";

import { useState } from "react";
import Link from "next/link";
import SidebarNav from "@/components/admin/SidebarNav";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-wrapper">
      <header className="admin-mobile-topbar">
        <button
          type="button"
          className="admin-menu-btn"
          aria-label="Open admin menu"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        <span className="admin-mobile-brand">SERENE ADMIN</span>
      </header>

      <div
        className={`admin-backdrop ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-brand">SERENE ADMIN</div>
        <SidebarNav onNavigate={() => setMenuOpen(false)} />
        <div className="sidebar-footer">
          <Link href="/admin/logout" className="nav-link" onClick={() => setMenuOpen(false)}>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
