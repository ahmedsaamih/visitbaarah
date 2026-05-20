"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "forgot" | "reset">("login");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok) {
        window.location.href = "/admin/dashboard";
      } else {
        setError(data?.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "forgot_password" }),
      });
      if (res.ok) {
        setMessage("OTP sent to your email");
        setView("reset");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, newPassword }),
      });
      if (res.ok) {
        setMessage("Password reset successful. Please login.");
        setView("login");
        setOtp("");
        setNewPassword("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "var(--admin-bg)"
    }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            {view === "login" ? "Admin Login" : view === "forgot" ? "Reset Password" : "Enter New Password"}
          </h1>
          <p style={{ color: "var(--admin-text-light)", fontSize: "14px" }}>
            {view === "login" ? "Enter your password to access the dashboard" : 
             view === "forgot" ? "Enter your recovery email to receive an OTP" : 
             "Enter the OTP sent to your email and your new password"}
          </p>
        </div>

        {message && (
          <p style={{ color: "var(--admin-success)", fontSize: "13px", marginBottom: "16px", textAlign: "center", padding: "8px", background: "#ecfdf5", borderRadius: "4px" }}>
            {message}
          </p>
        )}

        {view === "login" && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>
            {error && <p style={{ color: "var(--admin-error)", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <button type="button" onClick={() => { setView("forgot"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "var(--admin-accent)", fontSize: "13px", cursor: "pointer" }}>
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="email">Recovery Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
              />
            </div>
            {error && <p style={{ color: "var(--admin-error)", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <button type="button" onClick={() => { setView("login"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "var(--admin-text-light)", fontSize: "13px", cursor: "pointer" }}>
                Back to Login
              </button>
            </div>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>Verification Code (OTP)</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p style={{ color: "var(--admin-error)", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <button type="button" onClick={() => { setView("forgot"); setError(""); setMessage(""); }} style={{ background: "none", border: "none", color: "var(--admin-text-light)", fontSize: "13px", cursor: "pointer" }}>
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

