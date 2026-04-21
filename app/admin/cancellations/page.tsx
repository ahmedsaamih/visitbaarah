"use client";

import { useEffect, useState } from "react";

export default function AdminCancellations() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/cancellations");
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
      } else {
        setError(data.error || "Failed to fetch requests");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResponse = async (id: number, status: string, adminResponse: string) => {
    try {
      const res = await fetch(`/api/admin/cancellations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminResponse }),
      });
      if (res.ok) {
        fetchRequests();
      } else {
        alert("Action failed");
      }
    } catch (err) {
      alert("An error occurred");
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
                <tr key={req.id}>
                  <td style={{ fontWeight: "600", fontSize: "12px" }}>{req.booking.referenceId}</td>
                  <td>{req.booking.guestName}</td>
                  <td style={{ maxWidth: "300px" }}>{req.reason}</td>
                  <td>{new Date(req.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${req.status}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === "pending" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          onClick={() => {
                            const response = prompt("Optional response to guest:");
                            handleResponse(req.id, "approved", response || "");
                          }}
                          className="btn btn-primary" 
                          style={{ padding: "4px 12px", fontSize: "12px" }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => {
                            const response = prompt("Reason for rejection:");
                            if (response) handleResponse(req.id, "rejected", response);
                          }}
                          className="btn btn-outline" 
                          style={{ padding: "4px 12px", fontSize: "12px", borderColor: "var(--admin-error)", color: "var(--admin-error)" }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {req.status !== "pending" && (
                      <div style={{ fontSize: "12px", color: "var(--admin-text-light)" }}>
                        <strong>Response:</strong> {req.adminResponse || "None"}
                      </div>
                    )}
                  </td>
                </tr>
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
