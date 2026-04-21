"use client";

import { useEffect } from "react";
import Navbar from "@/components/public/Navbar";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[Global Error Boundary]:", error);
  }, [error]);

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <Navbar />
      <div className="container" style={{ paddingTop: "150px", textAlign: "center" }}>
        <h4 style={{ color: "#e63946", letterSpacing: "2px", marginBottom: "16px" }}>UNEXPECTED ERROR</h4>
        <h1 style={{ fontSize: "48px", marginBottom: "24px" }}>Something went wrong</h1>
        <p style={{ color: "var(--text-light)", maxWidth: "600px", margin: "0 auto 40px" }}>
          We encountered a slight turbulence while loading your request. 
          Please try refreshing the page or return to our home page.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <button onClick={() => reset()} className="btn-luxury">Try Again</button>
          <a href="/" className="btn-outline-gold">Return Home</a>
        </div>
        {process.env.NODE_ENV === "development" && (
           <pre style={{ marginTop: "40px", padding: "20px", background: "#f1f5f9", borderRadius: "8px", textAlign: "left", overflow: "auto", fontSize: "12px" }}>
             {error.message}
             <br/>
             {error.stack}
           </pre>
        )}
      </div>
    </main>
  );
}
