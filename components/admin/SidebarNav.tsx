"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard",    href: "/admin/dashboard" },
  { label: "Businesses",   href: "/admin/businesses" },
  { label: "Bookings",     href: "/admin/bookings" },
  { label: "Cancellations", href: "/admin/cancellations" },
  { label: "Gallery",      href: "/admin/gallery" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "Cultural Events", href: "/admin/cultural-events" },
  { label: "Settings",     href: "/admin/settings" },
  // Room management — shown below separator
  { label: "Room Types",   href: "/admin/room-types",  section: "rooms" },
  { label: "Rooms",        href: "/admin/rooms",       section: "rooms" },
  { label: "Availability", href: "/admin/availability", section: "rooms" },
];

interface SidebarNavProps {
  onNavigate?: () => void;
}

export default function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  const mainItems = navItems.filter((i) => !i.section);
  const roomItems = navItems.filter((i) => i.section === "rooms");

  return (
    <nav className="sidebar-nav">
      {mainItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-link ${pathname === item.href ? "active" : ""}`}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      ))}
      <div style={{
        margin: "12px 0 8px",
        padding: "0 16px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        color: "var(--admin-text-light)",
        opacity: 0.5,
      }}>
        Room Mgmt
      </div>
      {roomItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-link ${pathname === item.href ? "active" : ""}`}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
