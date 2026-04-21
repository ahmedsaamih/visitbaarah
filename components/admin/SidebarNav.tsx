"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Cancellations", href: "/admin/cancellations" },
  { label: "Room Types", href: "/admin/room-types" },
  { label: "Rooms", href: "/admin/rooms" },
  { label: "Availability", href: "/admin/availability" },
  { label: "Activities", href: "/admin/activities" },
  { label: "Tours", href: "/admin/tours" },
  { label: "Restaurant", href: "/admin/menu" },
  { label: "Services", href: "/admin/services" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "Settings", href: "/admin/settings" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="sidebar-nav">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-link ${pathname === item.href ? "active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
