"use client";

import { useEffect, useState } from "react";

export default function AdminCancellations() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<"approved" | "rejected" | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/cancellations");
      const data = await res.json();
      if (res.ok) setRequests(data);
      else setError(data.error || "Failed to fetch requests");
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const openAction = (id: number, action: "approved" | "rejected") => {
    setActiveId(id);
    setActiveAction(action);
    setResponseText("");
  };

  const cancelAction = () => {
    setActiveId(null);
    setActiveAction(null);
    setResponseText("");
  };

  const confirmAction = async () => {
    if (!activeId || !activeAction) return;
    if (activeAction === "rejected" && !responseText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/cancellations/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: activeAction, adminResponse: responseText }),
      });
      if (res.ok) {
        cancelAction();
        fetchRequests();
      } else {
        alert("Action failed");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading cancellation requests...</div>;
  if (error) return <div className="card" style={{ color: "var(--admin-error)" }}>{error}</div>;

  return (
    <div>
      <div className="title-row">
        <h1>Cancellation Requests</h1>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Booking REF</th>
                <th>Guest</th>
                <th>Reason</th>
                <th>Requested At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <>
                  <tr key={req.id}>
                    <td style={{ fontWeight: "600", fontSize: "12px" }}>{req.booking.referenceId}</td>
                    <td>{req.booking.guestName}</td>
                    <td style={{ maxWidth: "300px" }}>{req.reason}</td>
                    <td>{new Date(req.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${req.status}`}>{req.status}</span>
                    </td>
                    <td>
                      {req.status === "pending" && activeId !== req.id && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => openAction(req.id, "approved")}
                            className="btn btn-primary"
                            style={{ padding: "4px 12px", fontSize: "12px" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openAction(req.id, "rejected")}
                            className="btn btn-outline"
                            style={{ padding: "4px 12px", fontSize: "12px", borderColor: "var(--admin-error)", color: "var(--admin-error)" }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {req.status !== "pending" && (
                        <div style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>
                          {req.adminResponse || "No response sent"}
                        </div>
                      )}
                    </td>
                  </tr>
                  {activeId === req.id && (
                    <tr key={`${req.id}-action`}>
                      <td colSpan={6} style={{ background: activeAction === "approved" ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.04)", borderTop: "none" }}>
                        <div style={{ padding: "12px 4px", display: "flex", flexDirection: "column", gap: "10px" }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: activeAction === "approved" ? "var(--admin-success)" : "var(--admin-error)", margin: 0 }}>
                            {activeAction === "approved" ? "Approve cancellation" : "Reject cancellation"} — Ref: {req.booking.referenceId}
                          </p>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder={activeAction === "approved" ? "Optional message to guest…" : "Reason for rejection (required)"}
                            rows={2}
                            style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--admin-border)", borderRadius: "6px", fontSize: "13px", fontFamily: "inherit", resize: "vertical" }}
                          />
                          {activeAction === "rejected" && !responseText.trim() && (
                            <p style={{ fontSize: "12px", color: "var(--admin-error)", margin: 0 }}>A reason is required when rejecting.</p>
                          )}
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={confirmAction}
                              disabled={submitting || (activeAction === "rejected" && !responseText.trim())}
                              className={`btn ${activeAction === "approved" ? "btn-primary" : "btn-outline"}`}
                              style={activeAction === "rejected" ? { padding: "6px 16px", fontSize: "13px", borderColor: "var(--admin-error)", color: "var(--admin-error)" } : { padding: "6px 16px", fontSize: "13px" }}
                            >
                              {submitting ? "Saving…" : `Confirm ${activeAction}`}
                            </button>
                            <button onClick={cancelAction} className="btn btn-outline" style={{ padding: "6px 16px", fontSize: "13px" }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--admin-text-light)" }}>
                    No cancellation requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
