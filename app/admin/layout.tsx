import "./admin.css";
import Link from "next/link";
import { headers } from "next/headers";
import SidebarNav from "@/components/admin/SidebarNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if we are on the login page
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">SERENE ADMIN</div>
        <SidebarNav />
        <div className="sidebar-footer">
          <Link href="/admin/logout" className="nav-link">
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
