import "./admin.css";
import { headers } from "next/headers";
import AdminShell from "@/components/admin/AdminShell";

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
    <AdminShell>{children}</AdminShell>
  );
}
