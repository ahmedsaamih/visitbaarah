"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
      } catch (err) {
        console.error("Logout failed", err);
        router.push("/admin/login");
      }
    };

    performLogout();
  }, [router]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "var(--admin-bg)",
      color: "var(--admin-text)"
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Logging out...</h1>
        <p style={{ color: "var(--admin-text-light)" }}>Please wait while we secure your session.</p>
      </div>
    </div>
  );
}
